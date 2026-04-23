package post

import pbpost "mono/pb/post"

func listRespFromPB(data *pbpost.PostListResp) *ListResp {
	if data == nil {
		return &ListResp{
			Posts: make([]*ListItem, 0),
		}
	}

	resp := &ListResp{
		Posts: make([]*ListItem, 0, len(data.Posts)),
		Total: int32(data.Total),
	}

	for _, item := range data.Posts {
		if item == nil {
			continue
		}

		resp.Posts = append(resp.Posts, &ListItem{
			Title:        item.Title,
			Summary:      item.Summary,
			PostId:       item.PostId,
			Uid:          item.Uid,
			Avatar:       item.Avatar,
			Nickname:     item.Nickname,
			LikeCount:    item.LikeCount,
			CollectCount: item.CollectCount,
			CommentCount: item.CommentCount,
			ViewCount:    item.ViewCount,
			IsTopped:     item.IsTopped,
			CreatedAt:    item.CreatedAt,
		})
	}

	return resp
}
