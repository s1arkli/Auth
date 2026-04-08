from string import Template

main_tpl = Template("""
package main

import "mono/service/$module/cmd"

func main(){
    cmd.Execute()
}    
""")

root_tpl = Template("""
package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "root",
	Short: "$module root",
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Help()
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
""")

rpc_tpl = Template("""
package cmd

import (
	"github.com/spf13/cobra"
	
	"mono/pkg/initial"
	"mono/service/$module/pkg"
)

func init() {
	rootCmd.AddCommand(authCmd)
}

var authCmd = &cobra.Command{
	Use:   "rpc",
	Short: "$module application",
	Run: func(cmd *cobra.Command, args []string) {
		initial.Viper(pkg.Module)
		initial.Postgres()
        //rpc初始化
	},
}
""")

dal_tpl = Template("""
package cmd

import (
	"github.com/spf13/cobra"

	"mono/pkg/dal"
	"mono/pkg/initial"
	"mono/service/$module/pkg"
)

func init() {
	rootCmd.AddCommand(dalCmd)
}

var dalCmd = &cobra.Command{
	Use: "dal",
	Run: func(cmd *cobra.Command, args []string) {
		initial.Viper(pkg.Module)
		initial.Postgres()
		dal.Gen(initial.GetDB(), pkg.Module)
	},
}
""")

logo_tpl = Template("""
package pkg

const Module = "$module"
""")