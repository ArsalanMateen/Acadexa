import { useState } from "react";

const fallbackSource = "/course-fallback.svg";

export default function CourseImage({
  src,
  alt,
  className,
  loading = "eager",
  decoding = "async",
  fetchPriority,
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const isFailed = failedSrc === src;
  const imageSource = !isFailed && src ? src : fallbackSource;

  return (
    <img
      src={imageSource}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      onError={() => setFailedSrc(src)}
    />
  );
}
