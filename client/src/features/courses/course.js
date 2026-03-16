import { request, authorization } from "../../shared/api/request.js";

const listPublished = (params = {}, signal) => {
  const query = new URLSearchParams();

  for (const key of ["limit", "cursor"]) {
    if (params[key] !== undefined && params[key] !== null) query.set(key, params[key]);
  }

  return request(`/api/courses/published${query.size ? `?${query}` : ""}`, { signal });
};

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

const update = (params, credentials, course) =>
  request(`/api/courses/${params.courseId}`, {
    method: "PUT",
    headers: authorization(credentials),
    body: course,
  });

const remove = (params, credentials) =>
  request(`/api/courses/${params.courseId}`, {
    method: "DELETE",
    headers: authorization(credentials),
  });

const newLesson = (params, credentials, lesson) =>
  request(`/api/courses/${params.courseId}/lesson/new`, {
    method: "PUT",
    headers: { ...authorization(credentials), "Content-Type": "application/json" },
    body: JSON.stringify({ lesson }),
  });

export { listPublished, read, listByInstructor, create, update, remove, newLesson };
