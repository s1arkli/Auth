package infra

import (
	"context"

	"gorm.io/gorm"

	"mono/service/node/internal/infra/dal"
	"mono/service/node/internal/infra/model"
)

type Node struct {
	db *gorm.DB
}

func NewNode(db *gorm.DB) *Node {
	return &Node{
		db: db,
	}
}

func (n *Node) ListNodes(ctx context.Context, uid int64, parentID *int64) ([]*model.Node, error) {
	nDal := dal.Use(n.db).Node
	query := nDal.WithContext(ctx).Where(nDal.UID.Eq(uid))

	if parentID != nil {
		query = query.Where(nDal.ParentID.Eq(*parentID))
	} else {
		query = query.Where(nDal.ParentID.IsNull())
	}

	return query.Find()
}
