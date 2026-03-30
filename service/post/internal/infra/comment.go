package infra

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"mono/service/post/internal/infra/dal"
	"mono/service/post/internal/infra/model"
)

type Comment struct {
	db *gorm.DB
}

func NewComment(db *gorm.DB) *Comment {
	return &Comment{db: db}
}

func (c *Comment) GetParentComment(ctx context.Context, postID, cursor int64, hotCommentIDs []int64, pageSize int) ([]*model.Comment, error) {
	cDal := dal.Use(c.db).Comment

	query := cDal.WithContext(ctx).Where(cDal.RootPost.Eq(postID), cDal.ParentComment.Eq(0))
	if cursor > 0 {
		query = query.Where(cDal.ID.Lt(cursor))
	}
	if len(hotCommentIDs) > 0 {
		query = query.Where(cDal.ID.NotIn(hotCommentIDs...))
	}

	data, err := query.
		Order(cDal.CreatedAt.Desc()).
		Limit(pageSize).
		Find()
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	return data, nil
}

func (c *Comment) GetHotComment(ctx context.Context, postID int64, pageSize int) ([]*model.Comment, error) {
	cDal := dal.Use(c.db).Comment

	data, err := cDal.WithContext(ctx).
		Where(cDal.RootPost.Eq(postID), cDal.ParentComment.Eq(0)).
		Order(cDal.LikeCount.Desc()).
		Limit(pageSize).
		Find()
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	return data, nil
}

func (c *Comment) CreateComment(ctx context.Context, postID, uid int64, content string, parentID, replyUID int64) error {
	cDal := dal.Use(c.db).Comment

	comment := &model.Comment{
		UID:      uid,
		Content:  content,
		RootPost: postID,
	}
	if parentID > 0 {
		comment.ParentComment = &parentID
	}
	if replyUID > 0 {
		comment.ReplyUID = &replyUID
	}

	err := cDal.WithContext(ctx).Create(comment)
	if err != nil {
		return err
	}

	// 更新帖子评论数
	pDal := dal.Use(c.db).Post
	pDal.WithContext(ctx).Where(pDal.ID.Eq(postID)).UpdateSimple(pDal.CommentCount.Add(1))
	return nil
}

func (c *Comment) GetChildrenComment(ctx context.Context, parentIDs []int64) ([]*model.Comment, error) {
	cDal := dal.Use(c.db).Comment
	data, err := cDal.WithContext(ctx).
		Where(cDal.ParentComment.In(parentIDs...)).
		Order(cDal.LikeCount.Desc()).
		Find()
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	return data, nil
}
