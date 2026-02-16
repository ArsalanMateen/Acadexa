import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { read } from "../course";

export default function Course() {
  const { courseId } = useParams();
  const auth = useAuth();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    read({ courseId }, controller.signal, { t: auth?.token }).then(data => {
      if (controller.signal.aborted) return;
      if (data?.error) setError(data.error); else setCourse(data);
    });
    return () => controller.abort();
  }, [courseId, auth]);
  if (error) return <p role="alert">{error}</p>;
  if (!course) return <p role="status">Loading course</p>;
  return <main><h1>{course.name}</h1><p>{course.description}</p><p>By {course.instructor?.name}</p><ol>{(course.lessons || []).map(lesson => <li key={lesson._id}>{lesson.title}</li>)}</ol>{auth?.user._id === course.instructor?._id && <Link to={`/teach/course/edit/${course._id}`}>Edit course</Link>}</main>;
}
