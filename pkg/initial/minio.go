package initial

import (
	"fmt"
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/spf13/viper"
)

var MinioClient *minio.Client

func Minio() {
	fmt.Println(viper.GetString("minio.endpoint"))
	fmt.Println(viper.GetString("minio.access_key"))
	fmt.Println(viper.GetString("minio.secret_key"))
	
	client, err := minio.New(viper.GetString("minio.endpoint"), &minio.Options{
		Creds:  credentials.NewStaticV4(viper.GetString("minio.access_key"), viper.GetString("minio.secret_key"), ""),
		Secure: false,
	})
	if err != nil {
		panic(err)
	}
	MinioClient = client
	log.Println("minio connected")
}

func GetMinioClient() *minio.Client {
	return MinioClient
}
