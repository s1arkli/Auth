proto:
	protoc --go_out=. --go_opt=module=mono \
	--go-grpc_out=. --go-grpc_opt=module=mono \
	--proto_path=./protos \
	protos/*.proto

doc:
	swag init --dir ./gateway/service -g doc.go --parseDependency --output ./gateway/doc/app

auth_dal:
	go run service/auth/main.go dal
post_dal:
	go run service/post/main.go dal
user_dal:
	go run service/user/main.go dal

run: proto doc
	docker-compose up

build: proto doc
	docker-compose up --build

stop:
	docker-compose down

clean:
	docker-compose down -v

dev: proto doc
	go run ./gateway main.go api
	go run ./service/auth main.go rpc
	go run ./service/post main.go rpc
	go run ./service/user main.go rpc