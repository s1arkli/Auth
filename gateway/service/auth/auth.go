package auth

import (
	"github.com/gin-gonic/gin"

	"auth/gateway/ecode"
	"auth/gateway/response"
	authpb "jwt/pb"
)

var (
	auth authpb.AuthServiceClient
)

func init() {
	auth = authpb.NewAuthServiceClient(GetGrpcConn())
}

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

	_, err := auth.Register(c, &authpb.RegisterReq{
		Account:  req.Account,
		Password: req.Password,
	})
	if err != nil {
		response.Fail(c, ecode.SystemErr)
		return
	}
	response.Success(c, "ok")
}

func Login(c *gin.Context) {
	req := struct {
		Account  string `json:"account"`
		Password string `json:"password"`
	}{}

	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, ecode.ParamErr)
		return
	}

	resp, err := auth.Login(c, &authpb.LoginReq{
		Account:  req.Account,
		Password: req.Password,
	})
	if err != nil {
		response.Fail(c, ecode.SystemErr)
		return
	}
	response.Success(c, resp)
}

func Refresh(c *gin.Context) {
	req := struct {
		RefreshToken string `json:"refresh_token"`
	}{}

	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, ecode.ParamErr)
		return
	}

	resp, err := auth.Refresh(c, &authpb.RefreshReq{
		RefreshToken: req.RefreshToken,
	})
	if err != nil {
		response.Fail(c, ecode.SystemErr)
		return
	}
	response.Success(c, resp)
}
