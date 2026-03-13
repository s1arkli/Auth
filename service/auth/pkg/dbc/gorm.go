package dbc

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	pgDB *gorm.DB
)

func InitPgsql() {
	dsn := "host=localhost user=admin password=123456 dbname=auth port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	pgDB = db
}

func GetAuthDB() *gorm.DB {
	return pgDB
}
