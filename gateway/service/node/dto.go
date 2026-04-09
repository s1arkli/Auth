package node

type (
	ListNodesReq struct {
		ParentID *int64 `json:"parentId"`
	}

	CreateReq struct {
		Type     int32  `json:"type" binding:"required,oneof=1 2"`
		ParentID *int64 `json:"parentId"`
		Title    string `json:"title" binding:"required,min=1,max=100"`
		Content  string `json:"content"`
	}

	UpdateReq struct {
		Id      int64  `json:"id" binding:"required,gt=0"`
		Title   string `json:"title" binding:"required,min=1,max=100"`
		Content string `json:"content"`
	}

	DeleteReq struct {
		Id int64 `json:"id" binding:"required,gt=0"`
	}
)
