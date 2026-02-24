import { useEffect, useState, useSyncExternalStore } from "react";
import { listPublished } from "./course.js";
import { createCourseCatalog } from "./courseCatalog.js";

export default function useCourseCatalog() {
  const [catalog] = useState(() => createCourseCatalog(listPublished));
  const state = useSyncExternalStore(catalog.subscribe, catalog.getSnapshot);

  useEffect(() => {
    catalog.start();
    return catalog.cancel;
  }, [catalog]);

  return { ...state, loadMore: catalog.loadMore, retry: catalog.start };
}
