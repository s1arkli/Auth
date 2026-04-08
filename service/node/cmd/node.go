package cmd

import (
	"fmt"
	"log"
	"net"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"google.golang.org/grpc"

	"mono/pb/node"
	"mono/pkg/initial"
	"mono/service/node/internal/infra"
	"mono/service/node/internal/interfaces"
	"mono/service/node/pkg"
)

func init() {
	rootCmd.AddCommand(authCmd)
}

var authCmd = &cobra.Command{
	Use:   "rpc",
	Short: "node application",
	Run: func(cmd *cobra.Command, args []string) {
		initial.Viper(pkg.Module)
		initial.Postgres()
		//rpc初始化

		db := initial.GetDB()
		defer initial.CloseDB()

		port := viper.GetString("server.node.port")
		lis, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
		if err != nil {
			log.Fatal("node tcp listen error: ", err)
		}

		server := grpc.NewServer()
		node.RegisterNodeServer(server, &interfaces.Node{
			Node: infra.NewNode(db),
		})

		if err := server.Serve(lis); err != nil {
			log.Fatal("node server error: ", err)
		}
	},
}
