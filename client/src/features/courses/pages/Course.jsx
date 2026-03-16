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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.header}>
          <div className={styles.coverWrap}>
            <CourseImage
              loading="eager"
              key={course._id}
              src={course.image || "/course-image-fallback.svg"}
              alt={course.name}
              className={styles.coverImage}
            />
          </div>

          <div className={styles.headerInfo}>
            <div className={styles.category}>{course.category || "General"}</div>
            <h1 className={styles.title}>{course.name}</h1>
            <div className={styles.instructor}>By {course.instructor?.name || "Instructor"}</div>
            <p className={styles.description}>{course.description}</p>
            <div className={styles.lessonsBadge}>
              <svg
                className={styles.metaIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>
                {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
              </span>
            </div>
          </div>
        </section>

        <div className={styles.grid}>
          <main className={styles.main}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Course lessons</h2>

              {lessons.length === 0 ? (
                <p className={styles.emptyText}>
                  No lessons have been added to this curriculum yet.
                </p>
              ) : (
                <div className={styles.lessons}>
                  {lessons.map((lesson, idx) => (
                    <div key={lesson._id || idx} className={styles.lesson}>
                      <div className={styles.lessonLeft}>
                        <span className={styles.lessonNumber}>{idx + 1}.</span>
                        <span className={styles.lessonTitle}>{lesson.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <div className={styles.actionBox}>
                {error && <p role="alert">{error}</p>}
                {isInstructor ? (
                  <div className={styles.buttonGroup}>
                    <Link to={`/teach/course/edit/${course._id}`} className={styles.primaryButton}>
                      Edit Course
                    </Link>
                    <button
                      type="button"
                      onClick={handlePublishToggle}
                      disabled={publishing}
                      className={course.published ? styles.mutedButton : styles.outlineButton}
                    >
                      {course.published ? "Unpublish Course" : "Publish Course"}
                    </button>
                  </div>
                ) : authData && membership.status === "checking" ? (
                  <p role="status">Checking enrollment…</p>
                ) : authData && membership.status === "error" ? (
                  <p role="alert">{membership.error}</p>
                ) : membership.status === "enrolled" ? (
                  <Link to={`/learn/${membership.enrollmentId}`} className={styles.primaryButton}>
                    Go to Classroom
                  </Link>
                ) : course.published ? (
                  <button
                    type="button"
                    onClick={handleEnroll}
                    className={styles.primaryButton}
                    disabled={enrolling}
                  >
                    {enrolling ? "Enrolling..." : "Enroll now"}
                  </button>
                ) : (
                  <div className={styles.draftAlert}>Course is currently in draft mode</div>
                )}
              </div>

              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <div className={styles.metaIconWrap}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className={styles.metaLabel}>Category</div>
                    <div className={styles.metaValue}>{course.category || "General"}</div>
                  </div>
                </div>

                <div className={styles.metaItem}>
                  <div className={styles.metaIconWrap}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <div className={styles.metaLabel}>Instructor</div>
                    <div className={styles.metaValue}>
                      {course.instructor?.name || "Instructor"}
                    </div>
                  </div>
                </div>

                <div className={styles.metaItem}>
                  <div className={styles.metaIconWrap}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <div className={styles.metaLabel}>Lessons</div>
                    <div className={styles.metaValue}>
                      {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                    </div>
                  </div>
                </div>

                <div className={styles.metaItem}>
                  <div className={styles.metaIconWrap}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <div className={styles.metaLabel}>Status</div>
                    <div className={styles.metaValue}>
                      {course.published ? "Published" : "Draft"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
