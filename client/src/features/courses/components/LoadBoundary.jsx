export default function LoadBoundary({ page, className }) {
  return <div className={className} aria-label="Course list progress">{page.loadMoreError && <p role="alert">{page.loadMoreError}</p>}{page.hasMore && !page.loadingMore && <button className="state-action" type="button" onClick={page.loadMore}>Load more</button>}{!page.hasMore && !page.loading && !page.error && <p role="status">Showing {page.courses.length} of {page.totalCount} courses</p>}</div>;
}
