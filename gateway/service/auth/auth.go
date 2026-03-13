package auth

import (
	"github.com/gin-gonic/gin"

	"auth/gateway/ecode"
	"auth/gateway/response"
	authpb "auth/pb"
)

func Register(c *gin.Context) {
	req := struct {
		Account    string `json:"account"`
		Password   string `json:"password"`
		RePassword string `json:"rePassword"`
	}{}

	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, ecode.ParamErr)
		return
	}

	authClient := authpb.NewAuthServiceClient(GetGrpcConn())
	_, err := authClient.Register(c, &authpb.RegisterReq{
		Account:    req.Account,
		Password:   req.Password,
		RePassword: req.RePassword,
	})
	if err != nil {
		response.Fail(c, ecode.SystemErr)
		return
	}
	response.Success(c, "ok")
}
