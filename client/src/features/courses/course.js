import { request, authorization } from "../../shared/api/request.js";

const listPublished = (signal) => request("/api/courses/published", { signal });

export { listPublished };
