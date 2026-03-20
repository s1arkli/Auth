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
	"mono/service/auth/pkg/gen"
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

func (a *Auth) isExist(ctx context.Context, account string) (bool, *model.Account) {
	aDal := dal.Use(a.DB).Account
	data, err := aDal.WithContext(ctx).Where(aDal.Account.Eq(account)).First()
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, nil
	}

	if data != nil {
		log.Printf("该用户已注册:%v", data.Account)
		return true, data
	}
	return false, nil
}

func (a *Auth) create(ctx context.Context, req *authpb.RegisterReq) error {
	aDal := dal.Use(a.DB).Account

	pwd, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	cm := &model.Account{
		UID:      gen.GetUid(),
		Account:  req.Account,
		Password: string(pwd),
	}
	return aDal.WithContext(ctx).Create(cm)
}

//----------------------------------------------------------------------------------------------------------------------

func (a *Auth) Login(ctx context.Context, loginReq *authpb.LoginReq) (*authpb.LoginResp, error) {
	is, data := a.isExist(ctx, loginReq.Account)
	if !is {
		return nil, errors.New("account does not exist")
	}

	if !a.isRightPwd(data.Password, loginReq.Password) {
		return nil, errors.New("password error")
	}

	rToken, err := jwt.GenerateToken(data.UID, 7*time.Hour*24, jwt.RefreshToken)
	aToken, err := jwt.GenerateToken(data.UID, 15*time.Minute, jwt.AccessToken)
	return &authpb.LoginResp{
		AccessToken:  aToken,
		RefreshToken: rToken,
	}, err
}

func (a *Auth) isRightPwd(pwd, pwdReq string) bool {
	if bcrypt.CompareHashAndPassword([]byte(pwd), []byte(pwdReq)) == nil {
		return true
	}
	return false
}

//----------------------------------------------------------------------------------------------------------------------

func (a *Auth) Refresh(ctx context.Context, req *authpb.RefreshReq) (*authpb.RefreshResp, error) {
	claim, err := jwt.ParseToken(req.RefreshToken)
	if err != nil || claim == nil {
		return &authpb.RefreshResp{}, err
	}

	if claim.TokenType != jwt.RefreshToken {
		return &authpb.RefreshResp{}, errors.New("token is invalid")
	}

	rToken, err := jwt.GenerateToken(claim.Uid, 7*time.Hour*24, jwt.RefreshToken)
	aToken, err := jwt.GenerateToken(claim.Uid, 15*time.Minute, jwt.AccessToken)

	return &authpb.RefreshResp{
		AccessToken:  aToken,
		RefreshToken: rToken,
	}, err
}
