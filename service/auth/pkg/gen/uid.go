package gen

import (
	"log"

	"github.com/bwmarrin/snowflake"
)

var node *snowflake.Node

func InitSnow() {
	var err error
	node, err = snowflake.NewNode(1)
	if err != nil {
		log.Fatal(err)
	}
}

func GetUid() int64 {
	return node.Generate().Int64()
}
