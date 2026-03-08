import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { enrollmentStatsByInstructor } from "../../learning/enrollment";
import { validStats } from "../enrollmentState";
import { listByInstructor } from "../course";

export default function MyCourses() {
  const auth = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [statsError, setStatsError] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    enrollmentStatsByInstructor({ t: auth.token }, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (data?.error) setStatsError(data.error); else setStats(data || {});
    });
    listByInstructor({ userId: auth.user._id }, { t: auth.token }, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (Array.isArray(data)) setCourses(data); else setError(data?.error || "Unable to load courses.");
    });
    return () => controller.abort();
  }, [auth]);
  return <main><h1>My courses</h1><Link to="/teach/course/new">Create course</Link>{error && <p role="alert">{error}</p>}{statsError && <p role="alert">{statsError}</p>}{courses.map(course => <article key={course._id}><h2>{course.name}</h2><p>{validStats(stats[course._id]) ? `${stats[course._id].totalEnrolled} enrolled, ${stats[course._id].totalCompleted} completed` : "Statistics unavailable"}</p><p>{course.published ? "Published" : "Draft"}</p><Link to={`/teach/course/edit/${course._id}`}>Edit</Link> <Link to={`/course/${course._id}`}>Preview</Link></article>)}</main>;
}
