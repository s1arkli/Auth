package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"mono/gateway/ecode"
	"mono/gateway/response"
	"mono/pkg/jwt"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr := c.GetHeader("authorization")
		if tokenStr == "" {
			response.Fail(c, ecode.New(1, "token is null"))
			c.Abort()
			return
		}

		tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")

		claims, err := jwt.ParseToken(tokenStr)
		if err != nil || claims == nil {
			response.Fail(c, ecode.New(1, "token is invalid"))
			c.Abort()
			return
		}
		if claims.TokenType != jwt.AccessToken {
			response.Fail(c, ecode.New(1, "token is invalid"))
			c.Abort()
			return
		}
		c.Set("uid", claims.Uid)
		c.Next()
	}
}
