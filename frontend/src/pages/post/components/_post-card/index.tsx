import "./index.css";
import dayjs from "dayjs"
import type {ListItem} from "../../../../types/api/post";

export default function PostCard(data: ListItem) {
    const now = dayjs();
    const target = dayjs(data.createdAt * 1000);
    const diffDays = now.startOf("day").diff(target.startOf("day"), "day");

    let createdAtText: string;
    if (diffDays === 0) {
        createdAtText = `今天`;
    } else if (diffDays === 1) {
        createdAtText = `昨天`;
    } else {
        createdAtText = target.format("YYYY-MM-DD HH:mm");
    }

    return (
        <article className="post-card">
            <header className="post-card__header">
                <div className="post-card__author-row">
                    <img className="post-card__avatar" src="/default-shark-avatar.svg" alt={`${data.nickname} 的头像`} />
                    <div className="post-card__author-meta">
                        <span className="post-card__author">{data.nickname}</span>
                        {data.isTopped ? <span className="post-card__tag">置顶</span> : null}
                    </div>
                </div>
                <time className="post-card__time">{createdAtText}</time>
            </header>

            <div className="post-card__body">
                <h2 className="post-card__title">{data.title}</h2>
                <p className="post-card__summary">{data.summary}</p>
            </div>

            <footer className="post-card__footer">
                <span className="post-card__stat">{data.commentCount} 评论</span>
                <span className="post-card__stat">{data.likeCount} 点赞</span>
                <span className="post-card__stat">{data.collectCount} 收藏</span>
                <span className="post-card__stat">{data.viewCount} 浏览</span>
            </footer>
        </article>
    );
}
