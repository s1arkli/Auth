package service

import (
	"context"

	"google.golang.org/protobuf/types/known/emptypb"

	authpb "auth/pb"
)

type AuthService struct {
	authpb.UnimplementedAuthServiceServer
}

func (a *AuthService) Register(ctx context.Context) (*emptypb.Empty, error) {
	return nil, nil
}

func (a *AuthService) Login(ctx context.Context, loginReq *authpb.LoginReq) (*authpb.LoginResp, error) {
	return nil, nil
}

func (a *AuthService) Refresh(context.Context, *authpb.RefreshReq) (*authpb.RefreshResp, error) {
	return nil, nil
}
