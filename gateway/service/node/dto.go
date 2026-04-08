package node

type (
	ListNodesReq struct {
		Uid      int64  `json:"uid" binding:"required,min=1"`
		ParentID *int64 `json:"parentId"`
	}
)
