package auth

import (
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	conn *grpc.ClientConn
)

func init() {
	authConn, err := grpc.NewClient("localhost:10001",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		panic(err)
	}
	conn = authConn
}

func GetGrpcConn() *grpc.ClientConn {
	return conn
}

func Close() {
	if conn != nil {
		_ = conn.Close()
	}
}
