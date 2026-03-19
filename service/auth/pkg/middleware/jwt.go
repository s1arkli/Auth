package middleware

import (
	"github.com/gin-gonic/gin"

	"mono/gateway/response"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr := c.GetHeader("authorization")
		if tokenStr == "" {
			response.AuthFail(c)
			c.Abort()
		} else if tokenStr == "test" {
			c.Next()
		}

	}
}
