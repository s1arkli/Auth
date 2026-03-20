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
	"mono/service/auth/pkg/gen"
)

func init() {
	rootCmd.AddCommand(authCmd)
}

var authCmd = &cobra.Command{
	Use:   "rpc",
	Short: "Auth application",
	Run: func(cmd *cobra.Command, args []string) {
		initial.Viper("service/auth/config.yaml")
		gen.InitSnow()

		dbc.InitPgsql()
		db := dbc.GetAuthDB()

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
