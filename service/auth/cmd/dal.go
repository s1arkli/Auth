package cmd

import (
	"github.com/spf13/cobra"

	"mono/gateway/initial"
	"mono/pkg/dal"
	"mono/service/auth/pkg/dbc"
)

func init() {
	rootCmd.AddCommand(dalCmd)
}

var dalCmd = &cobra.Command{
	Use: "dal",
	Run: func(cmd *cobra.Command, args []string) {
		initial.Viper("application/jwt/config.yaml")
		dbc.InitPgsql()
		dal.Gen(dbc.GetAuthDB(), "jwt")
	},
}
