package cmd

import (
	"fmt"
	"log"
	"net"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"google.golang.org/grpc"

	"mono/gateway/initial"
	authpb "mono/pb"
	"mono/service/auth/internal/interfaces"
	"mono/service/auth/pkg/dbc"
)

var authCmd = &cobra.Command{
	Use:   "jwt",
	Short: "Auth application",
	Run: func(cmd *cobra.Command, args []string) {
		dbc.InitPgsql()
		db := dbc.GetAuthDB()

		initial.Viper("application/jwt/config.yaml")

		lis, err := net.Listen("tcp", fmt.Sprintf(":%s", viper.GetString("port")))
		if err != nil {
			log.Fatal(err)
		}

		s := grpc.NewServer()

		// 这一步是必须的：把你的实现注册到 gRPC Server
		authpb.RegisterAuthServiceServer(s, &interfaces.Auth{
			DB: db,
		})

		log.Println("grpc server listening on :9090")
		if err := s.Serve(lis); err != nil {
			log.Fatal(err)
		}
	},
}
