package infra

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"mono/service/post/internal/infra/dal"
	"mono/service/post/internal/infra/model"
)

type Like struct {
	db *gorm.DB
}

func NewLike(db *gorm.DB) *Like {
	return &Like{db: db}
}

// ToggleLike 点赞/取消点赞，返回 true 表示点赞，false 表示取消
func (l *Like) ToggleLike(ctx context.Context, uid, targetID int64, targetType int16) (bool, error) {
	lDal := dal.Use(l.db).Like

	_, err := lDal.WithContext(ctx).
		Where(lDal.UID.Eq(uid), lDal.TargetID.Eq(targetID), lDal.TargetType.Eq(targetType)).
		First()

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, err
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// 点赞
		err = lDal.WithContext(ctx).Create(&model.Like{
			UID:        uid,
			TargetID:   targetID,
			TargetType: targetType,
		})
		if err != nil {
			return false, err
		}
		l.updateLikeCount(ctx, targetID, targetType, 1)
		return true, nil
	}

	// 取消点赞
	_, err = lDal.WithContext(ctx).
		Where(lDal.UID.Eq(uid), lDal.TargetID.Eq(targetID), lDal.TargetType.Eq(targetType)).
		Delete()
	if err != nil {
		return false, err
	}
	l.updateLikeCount(ctx, targetID, targetType, -1)
	return false, nil
}

// updateLikeCount 更新帖子或评论的点赞数
func (l *Like) updateLikeCount(ctx context.Context, targetID int64, targetType int16, delta int) {
	if targetType == 1 {
		// 帖子
		pDal := dal.Use(l.db).Post
		pDal.WithContext(ctx).Where(pDal.ID.Eq(targetID)).UpdateSimple(pDal.LikeCount.Add(int32(delta)))
	} else if targetType == 2 {
		// 评论
		cDal := dal.Use(l.db).Comment
		cDal.WithContext(ctx).Where(cDal.ID.Eq(targetID)).UpdateSimple(cDal.LikeCount.Add(int64(delta)))
	}
}

// IsLiked 检查单个目标是否被点赞
func (l *Like) IsLiked(ctx context.Context, uid, targetID int64, targetType int16) bool {
	if uid == 0 {
		return false
	}
	lDal := dal.Use(l.db).Like
	count, _ := lDal.WithContext(ctx).
		Where(lDal.UID.Eq(uid), lDal.TargetID.Eq(targetID), lDal.TargetType.Eq(targetType)).
		Count()
	return count > 0
}

// BatchIsLiked 批量检查是否点赞，返回已点赞的 targetID 集合
func (l *Like) BatchIsLiked(ctx context.Context, uid int64, targetIDs []int64, targetType int16) map[int64]bool {
	result := make(map[int64]bool)
	if uid == 0 || len(targetIDs) == 0 {
		return result
	}
	lDal := dal.Use(l.db).Like
	likes, err := lDal.WithContext(ctx).
		Where(lDal.UID.Eq(uid), lDal.TargetID.In(targetIDs...), lDal.TargetType.Eq(targetType)).
		Find()
	if err != nil {
		return result
	}
	for _, like := range likes {
		result[like.TargetID] = true
	}
	return result
}
