package trans

import (
	"google.golang.org/protobuf/types/known/timestamppb"

	"mono/pb/node"
	"mono/service/node/internal/infra/model"
)

func ModelToGRpc(model *model.Node) *node.NodeItem {
	res := &node.NodeItem{}
	if model == nil {
		return res
	}

	res = &node.NodeItem{
		Id:        model.ID,
		Uid:       model.UID,
		Type:      node.NodeType(model.Type),
		ParentId:  model.ParentID,
		Title:     model.Title,
		Sort:      model.Sort,
		CreatedAt: timestamppb.New(model.CreatedAt),
		UpdatedAt: timestamppb.New(model.UpdatedAt),
	}
	return res
}

func ModelsToGRpc(models []*model.Node) *node.ListNodeResp {
	res := &node.ListNodeResp{}
	if len(models) == 0 {
		return res
	}

	for _, mdl := range models {
		res.List = append(res.List, ModelToGRpc(mdl))
	}
	return res
}
