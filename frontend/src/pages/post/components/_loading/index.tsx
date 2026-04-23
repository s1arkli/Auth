import "./index.css";

const skeletonCards = Array.from({length: 4});

export default function PostLoading() {
    return (
        <section className="post-page__feed" aria-label="帖子骨架列表">
            {skeletonCards.map((_, index) => (
                <article key={index} className="post-loading-card" aria-hidden="true">
                    <header className="post-loading-card__header">
                        <div className="post-loading-card__author">
                            <span className="post-loading-card__avatar post-loading-card__shine"/>
                            <span className="post-loading-card__author-meta post-loading-card__shine"/>
                        </div>
                        <span className="post-loading-card__tag post-loading-card__shine"/>
                    </header>

                    <div className="post-loading-card__body">
                        <span className="post-loading-card__title post-loading-card__shine"/>
                        <span className="post-loading-card__summary post-loading-card__shine"/>
                    </div>

                    <footer className="post-loading-card__footer">
                        <span className="post-loading-card__stat post-loading-card__shine"/>
                        <span
                            className="post-loading-card__stat post-loading-card__stat--wide post-loading-card__shine"/>
                        <span
                            className="post-loading-card__stat post-loading-card__stat--narrow post-loading-card__shine"/>
                    </footer>
                </article>
            ))}
        </section>

    );
}
