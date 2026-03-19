package interfaces

import (
	"context"
	"errors"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"google.golang.org/protobuf/types/known/emptypb"
	"gorm.io/gorm"

	authpb "mono/pb"
	"mono/pkg/jwt"
	"mono/service/auth/internal/infra/dal"
	"mono/service/auth/internal/infra/model"
)

type Auth struct {
	authpb.UnimplementedAuthServiceServer
	DB *gorm.DB
}

func (a *Auth) Register(ctx context.Context, req *authpb.RegisterReq) (*emptypb.Empty, error) {

	is, _ := a.isExist(ctx, req.Account)
	if is {
		return &emptypb.Empty{}, errors.New("account exists")
	}

	if err := a.create(ctx, req); err != nil {
		return &emptypb.Empty{}, err
	}

	return &emptypb.Empty{}, nil
}

func (a *Auth) isExist(ctx context.Context, account string) (bool, int64) {
	aDal := dal.Use(a.DB).Account
	data, err := aDal.WithContext(ctx).Where(aDal.Account.Eq(account)).First()
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, 0
	}

	if data != nil {
		log.Printf("该用户已注册:%v", data.Account)
		return true, data.UID
	}
	return false, 0
}

func (a *Auth) create(ctx context.Context, req *authpb.RegisterReq) error {
	aDal := dal.Use(a.DB).Account

	pwd, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	cm := &model.Account{
		Account:  req.Account,
		Password: string(pwd),
	}
	return aDal.WithContext(ctx).Create(cm)
}

//----------------------------------------------------------------------------------------------------------------------

func (a *Auth) Login(ctx context.Context, loginReq *authpb.LoginReq) (*authpb.LoginResp, error) {
	is, uid := a.isExist(ctx, loginReq.Account)
	if !is {
		return nil, errors.New("account does not exist")
	}
	token, _ := jwt.GenerateToken(uid, 7*time.Hour*24)
	return nil, nil
}

func (a *Auth) Refresh(context.Context, *authpb.RefreshReq) (*authpb.RefreshResp, error) {
	return nil, nil
}
