import { request, authorization } from "../../shared/api/request.js";

const create = (params, credentials) =>
  request(`/api/enrollment/new/${params.courseId}`, {
    method: "POST",
    headers: authorization(credentials),
  });

const read = (params, credentials, signal) =>
  request(`/api/enrollment/${params.enrollmentId}`, {
    headers: authorization(credentials),
    signal,
  });

const listEnrolled = (credentials, signal) =>
  request("/api/enrollment/enrolled", { headers: authorization(credentials), signal });

const complete = (params, credentials, enrollmentData) =>
  request(`/api/enrollment/complete/${params.enrollmentId}`, {
    method: "PUT",
    headers: { ...authorization(credentials), "Content-Type": "application/json" },
    body: JSON.stringify(enrollmentData),
  });

const enrollmentStats = (params, credentials, signal) =>
  request(`/api/enrollment/stats/${params.courseId}`, {
    headers: authorization(credentials),
    signal,
  });

const enrollmentStatsByInstructor = (credentials, signal) =>
  request("/api/enrollment/stats/by-instructor", { headers: authorization(credentials), signal });

export { create, read, listEnrolled, complete, enrollmentStats, enrollmentStatsByInstructor };
