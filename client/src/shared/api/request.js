export async function request(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return { error: data?.error || `Request failed (${response.status}). Please try again.` };
    }

    return data ?? { error: "The server returned an invalid response. Please try again." };
  } catch (error) {
    if (error.name === "AbortError") return { aborted: true };

    return { error: "Unable to connect. Please try again." };
  }
}

export const authorization = (credentials) => ({
  Accept: "application/json",
  Authorization: `Bearer ${credentials.t}`,
});
