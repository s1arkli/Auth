package interfaces

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"mono/pb/node"
	"mono/service/node/internal/infra"
	"mono/service/node/internal/interfaces/trans"
)

type Node struct {
	node.UnimplementedNodeServer
	Node *infra.Node
}

func NewNode(node *infra.Node) *Node {
	return &Node{
		Node: node,
	}
}

func (n *Node) ListNode(ctx context.Context, req *node.ListNodeReq) (*node.ListNodeResp, error) {
	nodes, err := n.Node.ListNodes(ctx, req.Uid, req.ParentId)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
	return trans.ModelsToGRpc(nodes), nil
}
