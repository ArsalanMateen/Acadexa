export default function CourseImage({ src, alt, className, loading = "eager" }) { return <img src={src || "/course-fallback.svg"} alt={alt} className={className} loading={loading} />; }
