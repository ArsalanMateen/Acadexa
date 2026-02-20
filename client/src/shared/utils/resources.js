export function safeHttpUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function getEmbedUrl(value) {
  const safe = safeHttpUrl(value);

  if (!safe) return null;

  const url = new URL(safe);
  const host = url.hostname.replace(/^www\./, "");
  let videoId;

  if (host === "youtu.be") {
    videoId = url.pathname.split("/")[1];
  } else if (
    ["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)
  ) {
    videoId =
      url.pathname === "/watch"
        ? url.searchParams.get("v")
        : /^\/(?:embed|v|shorts|live)\//.test(url.pathname)
          ? url.pathname.split("/")[2]
          : null;
  }
  if (videoId && /^[\w-]{11}$/.test(videoId)) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop();

    if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
  }

  return null;
}

export function isDirectVideo(value) {
  const safe = safeHttpUrl(value);

  return safe ? /\.(mp4|webm)$/i.test(new URL(safe).pathname) : false;
}
