package router

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "mono/gateway/doc/app" // 必须匿名导入生成的 docs 包
	"mono/gateway/service/auth"
)

func Api(r *gin.Engine) {
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	{
		//登录
		acc := r.Group("account").Use()
		acc.POST("/register", auth.Register)
		acc.POST("/login", auth.Login)
		acc.POST("/refresh", auth.Refresh)
	}
}
