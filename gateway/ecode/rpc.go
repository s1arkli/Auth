package ecode

import (
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// FromRpcErr 将 gRPC error 转换为业务错误码+消息
func FromRpcErr(err error) (int32, string) {
	st, ok := status.FromError(err)
	if !ok {
		return -1, "内部错误"
	}

	// 连接/传输层错误 → 统一映射为你自己的错误码
	switch st.Code() {
	case codes.Unavailable:
		return 503, "服务暂不可用"
	case codes.DeadlineExceeded:
		return 504, "请求超时"
	case codes.Canceled:
		return 499, "请求已取消"
	case codes.ResourceExhausted:
		return 429, "请求过于频繁"
	case codes.OK:
		return 0, ""
	default:
		// 业务错误：下游通过 status.New(codes.X, "msg") 返回的
		// 这里直接用 message，code 映射成你的业务码
		return int32(st.Code()), st.Message()
	}
}
