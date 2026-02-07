import { request, authorization } from "../../shared/api/request.js";

const create = (user) =>
  request("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

export { create };
