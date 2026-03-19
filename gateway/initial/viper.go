package initial

import (
	"fmt"
	"os"
	"strings"

	"github.com/spf13/viper"
)

func Viper(path string) {
	viper.SetEnvPrefix("mono")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	viper.SetConfigFile(path)
	if err := viper.ReadInConfig(); err != nil {
		fmt.Fprintf(os.Stderr, "fatal: read config %s failed: %v\n", path, err)
		os.Exit(1)
	}
}
