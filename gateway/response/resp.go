package response

import (
	"github.com/gin-gonic/gin"

	"auth/gateway/ecode"
)

type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data,omitempty"`
}

func Fail(c *gin.Context, err ecode.Error) {
	c.JSON(200, &Response{
		Code: err.Code(),
		Msg:  err.Error(),
	})
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(200, &Response{
		Code: 0,
		Msg:  "success",
		Data: data,
	})
}
