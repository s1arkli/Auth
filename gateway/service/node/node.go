package node

import (
	"github.com/gin-gonic/gin"

	"mono/gateway/ecode"
	"mono/gateway/response"
	"mono/pb/node"
)

type Service struct {
	node node.NodeClient
}

func NewService(node node.NodeClient) *Service {
	return &Service{
		node: node,
	}
}

func (s *Service) ListNodes(c *gin.Context) {
	param := new(ListNodesReq)
	if err := c.ShouldBind(param); err != nil {
		response.Fail(c, ecode.ParamErr)
		return
	}
	data, err := s.node.ListNode(c, &node.ListNodeReq{
		Uid:      param.Uid,
		ParentId: param.ParentID,
	})

	if err != nil {
		_, msg := ecode.FromRpcErr(err)
		response.Fail(c, ecode.New(1, msg))
		return
	}
	response.Success(c, data)
}
