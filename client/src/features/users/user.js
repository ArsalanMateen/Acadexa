import { request, authorization } from "../../shared/api/request.js";

const create = (user) =>
  request("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

const list = (signal) => request("/api/users", { signal });

const read = (params, credentials, signal) =>
  request(`/api/users/${params.userId}`, {
    headers: authorization(credentials),
    signal,
  });

const update = (params, credentials, user) =>
  request(`/api/users/${params.userId}`, {
    method: "PUT",
    headers: {
      ...authorization(credentials),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

const remove = (params, credentials) =>
  request(`/api/users/${params.userId}`, {
    method: "DELETE",
    headers: authorization(credentials),
  });

export { create, list, read, update, remove };
