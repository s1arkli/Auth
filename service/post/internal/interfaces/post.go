package interfaces

import (
	"context"

	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"

	"mono/pb"
	"mono/service/post/internal/infra"
)

type Post struct {
	pb.UnimplementedPostServer
	post    *infra.Post
	comment *infra.Comment
	like    *infra.Like

	userClient pb.UserClient
}

func NewPost(post *infra.Post, comment *infra.Comment, like *infra.Like, user pb.UserClient) *Post {
	return &Post{
		post:    post,
		comment: comment,
		like:    like,

		userClient: user,
	}
}

func (p *Post) List(ctx context.Context, req *pb.PostListReq) (*pb.PostListResp, error) {
	errRes := &pb.PostListResp{}

	data, total, err := p.post.List(ctx, req)
	if err != nil {
		return errRes, status.Error(1, err.Error())
	}
	if len(data) == 0 {
		return errRes, nil
	}
	resp, uids := postModelsToPB(data, total)
	userMap, err := p.userClient.BatchGetUserInfo(ctx, &pb.BatchGetUserReq{Uids: uids})
	if err == nil {
		appendUserInfo(resp, userMap.Users)
	}

	// 设置 is_liked
	if req.Uid > 0 {
		postIDs := make([]int64, 0, len(data))
		for _, v := range data {
			postIDs = append(postIDs, v.ID)
		}
		likedMap := p.like.BatchIsLiked(ctx, req.Uid, postIDs, 1)
		for _, item := range resp.Posts {
			item.IsLiked = likedMap[item.PostId]
		}
	}

	return resp, nil
}

func (p *Post) Create(ctx context.Context, req *pb.PostCreateReq) (*emptypb.Empty, error) {
	return &emptypb.Empty{}, status.Error(1, p.post.Create(ctx, req).Error())
}

func (p *Post) Detail(ctx context.Context, req *pb.PostDetailReq) (*pb.PostDetailResp, error) {
	data, err := p.post.Detail(ctx, req)
	if err != nil {
		return nil, status.Error(1, err.Error())
	}
	res := &pb.PostDetailResp{
		Title:        data.Title,
		Content:      data.Content,
		Uid:          data.UID,
		Avatar:       "",
		Nickname:     "",
		LikeCount:    data.LikeCount,
		CollectCount: data.CollectCount,
		ViewCount:    data.ViewCount,
	}

	user, err := p.userClient.GetUserInfo(ctx, &pb.GetUserReq{Uid: data.UID})
	if err == nil {
		res.Avatar = user.Avatar
		res.Nickname = user.Nickname
	}

	// 设置 is_liked
	if req.Uid > 0 {
		res.IsLiked = p.like.IsLiked(ctx, req.Uid, req.PostId, 1)
	}

	return res, nil
}
