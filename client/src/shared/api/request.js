import auth from "../session/auth-helper.js";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export async function request(url, options = {}) {
  try {
    const resolvedUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const response = await fetch(resolvedUrl, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && options.headers?.Authorization)
        auth.clearJWT();

      return {
        error:
          data?.error ||
          `Request failed (${response.status}). Please try again.`,
      };
    }

    return (
      data ?? {
        error: "The server returned an invalid response. Please try again.",
      }
    );
  } catch (error) {
    if (error.name === "AbortError") return { aborted: true };

    return { error: "Unable to connect. Please try again." };
  }
}

export const authorization = (credentials) => ({
  Accept: "application/json",
  Authorization: `Bearer ${credentials.t}`,
});
