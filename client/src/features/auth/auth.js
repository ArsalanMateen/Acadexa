import { request } from "../../shared/api/request.js";

const signin = (user) =>
  request("/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

const signout = () => request("/auth/signout");

export { signin, signout };
