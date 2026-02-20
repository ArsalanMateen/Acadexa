export function safeHttpUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
