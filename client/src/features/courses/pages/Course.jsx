import CourseImage from "../../../shared/components/CourseImage";
import useRecordScope from "../../../shared/hooks/useRecordScope";
import { PageSkeleton, PageState } from "../../../shared/components/ui";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { read, update } from "../course";
import { create as createEnrollment, enrollmentForCourse } from "../../learning/enrollment";
import selfPacedLearningImg from "../../../assets/self-paced-learning.png";
import { enrollmentLookup } from "../enrollmentState";
import styles from "./Course.module.css";

export default function Course() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState({ instructor: {}, lessons: [] });
  const [membershipState, setMembership] = useState({
    status: "checking",
    enrollmentId: null,
    error: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const authData = useAuth();
  const identity = `${courseId}:${authData?.token || "anonymous"}`;
  const capture = useRecordScope(identity);
  const [loadedIdentity, setLoadedIdentity] = useState(null);
  const membership =
    membershipState.identity === identity
      ? membershipState
      : { status: authData ? "checking" : "notEnrolled", enrollmentId: null, error: "" };

  useEffect(() => {
    const abortController = new AbortController();
    const isCurrent = capture();

    // oxlint-disable-next-line react/set-state-in-effect -- Reset stale content when starting a new asynchronous request.
    setLoading(true);
    setLoadError("");
    setEnrolling(false);
    setPublishing(false);
    setLoadedIdentity(identity);

    const signal = abortController.signal;

    setError("");
    read({ courseId }, signal, { t: authData?.token }).then((data) => {
      if (signal.aborted || !isCurrent()) return;
      if (data?.error || !data?._id) {
        setLoadError(data?.error || "Course not found.");
      } else setCourse(data);

      setLoading(false);
    });

    return () => abortController.abort();
  }, [courseId, authData, identity, capture]);

  useEffect(() => {
    const controller = new AbortController();
    const isCurrent = capture();

    // oxlint-disable-next-line react/set-state-in-effect -- New course/account requires a fresh enrollment decision.
    setMembership({
      identity,
      status: authData ? "checking" : "notEnrolled",
      enrollmentId: null,
      error: "",
    });

    if (authData) {
      enrollmentForCourse({ courseId }, { t: authData.token }, controller.signal).then((data) => {
        if (controller.signal.aborted || data?.aborted || !isCurrent()) return;

        setMembership({ ...enrollmentLookup(data), identity });
      });
    }

    return () => controller.abort();
  }, [courseId, authData, identity, capture]);

  const handleEnroll = async () => {
    if (!authData) {
      navigate("/signin", { state: { from: { pathname: `/course/${courseId}` } } });
      return;
    }

    if (enrolling || membership.status !== "notEnrolled") return;

    setError("");
    setEnrolling(true);

    const isCurrent = capture();

    const result = await createEnrollment({ courseId }, { t: authData.token });

    if (!isCurrent()) return;
    if (result && !result.error) {
      navigate(`/learn/${result._id}`);
    } else {
      setError(result?.error || "Failed to enroll. Please try again.");
      setEnrolling(false);
    }
  };

  const handlePublishToggle = async () => {
    if (publishing) return;

    setPublishing(true);
    setError("");

    const courseData = new FormData();
    courseData.append("published", !course.published);

    const isCurrent = capture();

    const data = await update({ courseId }, { t: authData.token }, courseData);

    if (!isCurrent()) return;
    if (data && !data.error) {
      setCourse(data);
    } else {
      setError(data?.error || "Failed to update course status.");
    }

    setPublishing(false);
  };

  if (loading || loadedIdentity !== identity) {
    return <PageSkeleton variant="detail" label="Loading course" />;
  }
  if (loadError) return <PageState error message={loadError} />;

  const isInstructor =
    authData && authData.user._id === (course.instructor?._id || course.instructor);
  const lessons = course.lessons || [];

  return (<main className={styles.page}><h1>{course.name}</h1><p>{course.description}</p><ol>{lessons.map(lesson => <li key={lesson._id}>{lesson.title}</li>)}</ol>{error && <p role="alert">{error}</p>}{isInstructor ? <><Link to={`/teach/course/edit/${course._id}`}>Edit course</Link><button onClick={handlePublishToggle} disabled={publishing}>{course.published ? "Unpublish" : "Publish"}</button></> : membership.status === "enrolled" ? <Link to={`/learn/${membership.enrollmentId}`}>Go to classroom</Link> : membership.status === "error" ? <p role="alert">{membership.error}</p> : membership.status === "checking" ? <p role="status">Checking enrollment</p> : course.published ? <button onClick={handleEnroll} disabled={enrolling}>Enroll now</button> : <p>Course is in draft mode</p>}</main>);
}
