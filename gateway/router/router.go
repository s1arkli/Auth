package router

import (
	"github.com/gin-gonic/gin"

	"auth/gateway/service/auth"
)

func Api(r *gin.Engine) {

	{
		//登录
		acc := r.Group("account")
		acc.POST("/register", auth.Register)
		acc.POST("/login", auth.Login)
		acc.POST("/refresh", auth.Refresh)
	}
}
