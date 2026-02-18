import { request, authorization } from "../../shared/api/request.js";

const listPublished = (signal) => request("/api/courses/published", { signal });

const read = (params, signal, credentials) =>
  request(`/api/courses/${params.courseId}`, {
    signal,
    ...(credentials?.t ? { headers: authorization(credentials) } : {}),
  });

const listByInstructor = (params, credentials, signal) =>
  request(`/api/courses/by/${params.userId}`, { headers: authorization(credentials), signal });

const create = (params, credentials, course) =>
  request(`/api/courses/by/${params.userId}`, {
    method: "POST",
    headers: authorization(credentials),
    body: course,
  });

export { listPublished, read, listByInstructor, create };
