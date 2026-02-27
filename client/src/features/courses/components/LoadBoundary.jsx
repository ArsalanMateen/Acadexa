import { useEffect, useRef } from "react";

export default function LoadBoundary({ page, className }) {
  const sentinel = useRef(null);
  const { hasMore, loading, loadingMore, loadMoreError, loadMore, courses } =
    page;

  useEffect(() => {
    if (
      !hasMore ||
      loading ||
      loadingMore ||
      loadMoreError ||
      !window.IntersectionObserver
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: "360px" },
    );
    observer.observe(sentinel.current);

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMoreError, loadMore, courses.length]);

  return (
    <div ref={sentinel} className={className} aria-label="Course list progress">
      {!hasMore && !loadingMore && !loadMoreError && (
        <p role="status">
          Showing {courses.length} of {page.totalCount}{" "}
          {page.totalCount === 1 ? "course" : "courses"}
        </p>
      )}
      {loadMoreError && <p role="alert">{loadMoreError}</p>}
      {hasMore && !loadingMore && !loadMoreError && (
        <button className="state-action" type="button" onClick={loadMore}>
          Load more
        </button>
      )}
    </div>
  );
}
