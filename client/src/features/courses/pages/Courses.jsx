import { useState, useEffect } from "react";
import CourseCard from "../components/CourseCard";
import { listPublished } from "../course";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    listPublished({}, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (Array.isArray(data?.courses)) setCourses(data.courses); else setError(data?.error || "Unable to load courses.");
      setLoading(false);
    });
    return () => controller.abort();
  }, []);
  return <main><h1>Published courses</h1>{loading ? <p role="status">Loading courses</p> : error ? <p role="alert">{error}</p> : courses.length === 0 ? <p>Published courses will appear here.</p> : courses.map(course => <CourseCard key={course._id} course={course} />)}</main>;
}
