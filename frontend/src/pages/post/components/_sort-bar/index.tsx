import "./index.css";

interface Props {
    activeTab:"latest" | "hot",
    onChange: (activeTab:"latest" | "hot") => void,
}

export default function PostSortBar({activeTab,onChange}: Props) {

    return (
        <div className="post-sort-bar" role="tablist" aria-label="帖子排序">
            <button
                type="button"
                role="tab"
                aria-selected={activeTab === "latest"}
                className={`post-sort-bar__button${activeTab === "latest" ? " post-sort-bar__button--active" : ""}`}
                onClick={() => onChange("latest")}
            >
                最新
            </button>
            <button
                type="button"
                role="tab"
                aria-selected={activeTab === "hot"}
                className={`post-sort-bar__button${activeTab === "hot" ? " post-sort-bar__button--active" : ""}`}
                onClick={() => onChange("hot")}
            >
                最热
            </button>
        </div>
    );
}
