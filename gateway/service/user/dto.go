package user

type (
	BatchGetUserInfoReq struct {
		Uids []int64 `json:"uids" binding:"required"`
	}

	UpdateUserReq struct {
		Uid      int64  `json:"uid" binding:"required"`
		Nickname string `json:"nickname" binding:"min=1,max=16"`
		Avatar   string `json:"avatar"`
	}
)
