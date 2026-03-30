package infra

import (
	"context"
	"errors"

	"gorm.io/gen/field"
	"gorm.io/gorm"

	"mono/pb"
	"mono/service/post/internal/infra/dal"
	"mono/service/post/internal/infra/model"
)

type Post struct {
	db *gorm.DB
}

func NewPost(db *gorm.DB) *Post {
	return &Post{
		db: db,
	}
}

func (p *Post) List(ctx context.Context, req *pb.PostListReq) ([]*model.Post, int64, error) {
	pDal := dal.Use(p.db).Post

	query := pDal.WithContext(ctx)
	if req.PostType != 0 {
		query = query.Where(pDal.PostType.Eq(int16(req.PostType)))
	}

	count, err := query.Count()
	if err != nil {
		return nil, 0, err
	}

	data, err := query.Offset(int((req.Page - 1) * req.PageSize)).
		Limit(int(req.PageSize)).
		Order(getOrderExpr(p.db, req.Sort)).
		Find()
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, 0, err
	}
	return data, count, nil
}

func getOrderExpr(db *gorm.DB, order pb.SortType) field.Expr {
	pDal := dal.Use(db).Post

	orderMap := map[pb.SortType]field.Expr{
		pb.SortType_SORT_TYPE_DEFAULT: pDal.CreatedAt.Desc(),
		pb.SortType_SORT_TYPE_HOT:     pDal.ViewCount.Desc(),
		pb.SortType_SORT_TYPE_NEW:     pDal.CreatedAt.Desc(),
	}
	return orderMap[order]
}

func (p *Post) Create(ctx context.Context, req *pb.PostCreateReq) error {
	pDal := dal.Use(p.db).Post

	return pDal.WithContext(ctx).Create(&model.Post{
		UID:      req.Uid,
		Title:    req.Title,
		Content:  req.Content,
		PostType: int16(req.PostType),
	})
}

func (p *Post) Detail(ctx context.Context, req *pb.PostDetailReq) (*model.Post, error) {
	pDal := dal.Use(p.db).Post

	data, err := pDal.WithContext(ctx).Where(pDal.ID.Eq(req.PostId)).First()
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if data == nil {
		return &model.Post{}, nil
	}
	return data, nil
}
