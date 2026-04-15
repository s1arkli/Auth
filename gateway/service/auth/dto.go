package auth

type (
	RegisterRequest struct {
		Account  string `json:"account" binding:"required,min=6,max=20"`
		Password string `json:"password" binding:"required,min=6,max=20"`
	}

	LoginRequest struct {
		Account  string `json:"account" binding:"required,min=6,max=20"`
		Password string `json:"password" binding:"required,min=6,max=20"`
	}

	LoginResp struct {
		AccessToken string `json:"accessToken"`
		Uid         int64  `json:"uid"`
		Nickname    string `json:"nickname"`
		Avatar      string `json:"avatar"`
		IsAdmin     bool   `json:"isAdmin"`
	}
)
