package auth

import (
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	conn *grpc.ClientConn
)

func initAuthConn() {
	authConn, err := grpc.NewClient("localhost:9900",
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
