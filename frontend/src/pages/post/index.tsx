import "./index.css";
import PostCard from "./components/_post-card";
import PostSortBar from "./components/_sort-bar";
import {useRef, useState} from "react";
import {postUseInfiniteQuery, useDelayedLoading, useIntersectionObserver} from "../../hooks/post"
import {POST_SORT, POST_TYPE} from "../../constants/post";
import PostLoading from "./components/_loading";

export default function Post() {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"latest" | "hot">("latest");
    const sort = activeTab === "latest" ? POST_SORT.NEW : POST_SORT.HOT;

    const {data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, error} = postUseInfiniteQuery({
        postType: POST_TYPE.DEFAULT,
        sort: sort,
    })

    const isShowLoading = useDelayedLoading(isLoading)

    if (error) {
        return <div>请求错误</div>
    }

    //哨兵：用于无限滚动场景
    useIntersectionObserver(
        sentinelRef,       // 观察谁：哨兵元素
        fetchNextPage,     // 看到了干嘛：加载下一页
        hasNextPage && !isFetchingNextPage  // 什么时候启用：有下一页 且 没在加载中
    );

    return (
        <main className="post-page">
            <section className="post-page__toolbar" aria-label="帖子排序工具栏">
                <PostSortBar activeTab={activeTab} onChange={setActiveTab}/>
            </section>
            <section className="post-page__feed" aria-label="帖子列表">
                {isShowLoading ? <PostLoading/> : data?.pages.flatMap(page => page.posts).map(post => (
                    <PostCard key={post.postId} {...post} />
                ))}
            </section>
            <div ref={sentinelRef}/>
        </main>
    );
}
