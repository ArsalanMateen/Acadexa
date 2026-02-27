const initialState = () => ({
  courses: [],
  totalCount: 0,
  hasMore: false,
  nextCursor: null,
  loading: true,
  loadingMore: false,
  error: "",
  loadMoreError: "",
});

// Request lifecycle is independent of React so cancellation and pagination can be tested directly.
export function createCourseCatalog(loader) {
  let state = initialState();
  let generation = 0;
  let active = null;
  const completedCursors = new Set();
  const listeners = new Set();
  const publish = (next) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  async function fetchPage(cursor) {
    if (active || (cursor && completedCursors.has(cursor))) return;

    const controller = new AbortController();

    active = controller;

    const currentGeneration = generation;

    publish({
      ...state,
      loading: !cursor,
      loadingMore: !!cursor,
      [cursor ? "loadMoreError" : "error"]: "",
    });

    try {
      const page = await loader(
        { limit: 12, ...(cursor ? { cursor } : {}) },
        controller.signal,
      );

      if (controller.signal.aborted || generation !== currentGeneration) return;
      if (page?.aborted) {
        throw new Error("The request was interrupted. Please try again.");
      }
      if (page?.error) throw new Error(page.error);
      if (
        !Array.isArray(page?.courses) ||
        page.courses.some(
          (item) => typeof item?._id !== "string" || !item._id,
        ) ||
        typeof page.hasMore !== "boolean" ||
        (cursor
          ? page.totalCount !== null
          : !Number.isSafeInteger(page.totalCount) || page.totalCount < 0) ||
        (page.hasMore
          ? !page.courses.length ||
            typeof page.nextCursor !== "string" ||
            !page.nextCursor ||
            page.nextCursor === cursor ||
            completedCursors.has(page.nextCursor)
          : page.nextCursor !== null)
      ) {
        throw new Error("Unable to load courses. Please try again.");
      }

      const existing = cursor ? state.courses : [];
      const ids = new Set(existing.map((course) => course._id));
      const additions = page.courses.filter((course) => {
        if (ids.has(course._id)) return false;

        ids.add(course._id);
        return true;
      });

      if (page.hasMore && !additions.length) {
        throw new Error("Unable to load more courses. Please try again.");
      }
      if (cursor) completedCursors.add(cursor);

      publish({
        ...state,
        courses: [...existing, ...additions],
        totalCount: cursor ? state.totalCount : page.totalCount,
        hasMore: page.hasMore,
        nextCursor: page.nextCursor,
        loading: false,
        loadingMore: false,
      });
    } catch (error) {
      if (!controller.signal.aborted && generation === currentGeneration) {
        publish({
          ...state,
          loading: false,
          loadingMore: false,
          [cursor ? "loadMoreError" : "error"]: error.message,
        });
      }
    } finally {
      if (active === controller) active = null;
    }
  }

  function cancel() {
    generation++;
    active?.abort();
    active = null;
  }

  return {
    getSnapshot: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start: () => {
      cancel();
      completedCursors.clear();
      publish(initialState());

      return fetchPage(null);
    },
    cancel,
    loadMore: () =>
      !state.loading && state.hasMore
        ? fetchPage(state.nextCursor)
        : Promise.resolve(),
  };
}
