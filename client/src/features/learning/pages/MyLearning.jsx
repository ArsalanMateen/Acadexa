import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { listEnrolled } from "../enrollment";
export default function MyLearning() {
  const auth = useAuth();
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    listEnrolled({ t: auth.token }, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (Array.isArray(data)) setEnrolled(data.filter(item => item.course)); else setError(data?.error || "Unable to load courses.");
      setLoading(false);
    });
    return () => controller.abort();
  }, [auth]);
  return <main><h1>My learning</h1>{loading ? <p role="status">Loading courses</p> : error ? <p role="alert">{error}</p> : enrolled.length === 0 ? <p>No enrolled courses yet.</p> : enrolled.map(item => <Link key={item._id} to={`/learn/${item._id}`}>{item.course.name}<span>{item.lessonStatus.filter(status => status.complete).length} of {item.course.lessons.length} completed</span></Link>)}</main>;
}
