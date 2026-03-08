import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { enrollmentLookup } from "../enrollmentState";
import { create as enroll, enrollmentForCourse } from "../../learning/enrollment";
import { useNavigate } from "react-router-dom";
import { read } from "../course";

export default function Course() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const auth = useAuth();
  const [membership, setMembership] = useState({ status: "checking" });
  useEffect(() => {
    const controller = new AbortController();
    setMembership({ status: auth ? "checking" : "notEnrolled" });
    if (auth) enrollmentForCourse({ courseId }, { t: auth.token }, controller.signal).then(data => { if (!controller.signal.aborted) setMembership(enrollmentLookup(data)); });
    return () => controller.abort();
  }, [courseId, auth]);
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
  const handleEnroll = async () => {
    if (!auth) { navigate("/signin", { state: { from: { pathname: `/course/${courseId}` } } }); return; }
    if (enrolling) return;
    setEnrolling(true);
    const result = await enroll({ courseId }, { t: auth.token });
    if (result?.error) { setError(result.error); setEnrolling(false); } else navigate(`/learn/${result._id}`);
  };
  if (error) return <p role="alert">{error}</p>;
  if (!course) return <p role="status">Loading course</p>;
  return <main><h1>{course.name}</h1><p>{course.description}</p><p>By {course.instructor?.name}</p><ol>{(course.lessons || []).map(lesson => <li key={lesson._id}>{lesson.title}</li>)}</ol>{auth?.user._id === course.instructor?._id && <Link to={`/teach/course/edit/${course._id}`}>Edit course</Link>}{course.published && auth?.user._id !== course.instructor?._id && <button onClick={handleEnroll} disabled={enrolling || membership.status !== "notEnrolled"}>Enroll now</button>}{membership.status === "enrolled" && <Link to={`/learn/${membership.enrollmentId}`}>Go to classroom</Link>}{membership.status === "error" && <p role="alert">{membership.error}</p>}</main>;
}
