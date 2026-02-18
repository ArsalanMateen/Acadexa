import { request, authorization } from "../../shared/api/request.js";

const listPublished = (signal) => request("/api/courses/published", { signal });

const read = (params, signal, credentials) =>
  request(`/api/courses/${params.courseId}`, {
    signal,
    ...(credentials?.t ? { headers: authorization(credentials) } : {}),
  });

const listByInstructor = (params, credentials, signal) =>
  request(`/api/courses/by/${params.userId}`, { headers: authorization(credentials), signal });

export { listPublished, read, listByInstructor };
