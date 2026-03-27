package user

import (
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/status"

	"mono/gateway/ecode"
	"mono/gateway/response"
	"mono/pb"
)

type Service struct {
	user pb.UserClient
	conn *grpc.ClientConn
}

func NewService(conn *grpc.ClientConn) *Service {
	return &Service{
		user: pb.NewUserClient(conn),
		conn: conn,
	}
}

// BatchGetUsersInfo 获取用户信息
// @Summary
// @Description
// @Tags         user
// @Accept       json
// @Produce      json
// @Param        request  body  BatchGetUserInfoReq  true  "批量获取用户信息"
// @Router       /api/v1/user/batch [post]
func (s *Service) BatchGetUsersInfo(c *gin.Context) {
	req := new(BatchGetUserInfoReq)
	if err := c.ShouldBind(req); err != nil {
		response.Fail(c, ecode.ParamErr)
		return
	}

	userMap, err := s.user.BatchGetUserInfo(c, &pb.BatchGetUserReq{
		Uids: req.Uids,
	})
	if err != nil {
		st, _ := status.FromError(err)
		response.Fail(c, ecode.New(1, st.Message()))
		return
	}
	response.Success(c, userMap)
}

// Update 修改用户信息
// @Summary
// @Description
// @Tags         user
// @Accept       json
// @Produce      json
// @Param        request  body  UpdateUserReq  true  "修改用户信息"
// @Router       /api/v1/user/update [post]
func (s *Service) Update(c *gin.Context) {
	req := new(UpdateUserReq)
	if err := c.ShouldBind(req); err != nil {
		response.Fail(c, ecode.ParamErr)
		return
	}

	if _, err := s.user.UpdateUser(c, &pb.UpdateUserReq{
		Uid:      req.Uid,
		Nickname: req.Nickname,
		Avatar:   req.Avatar,
	}); err != nil {
		st, _ := status.FromError(err)
		response.Fail(c, ecode.New(1, st.Message()))
		return
	}
	response.Success(c, "ok")
}
