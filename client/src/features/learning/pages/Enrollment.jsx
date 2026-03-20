import CourseImage from "../../../shared/components/CourseImage";
import useRecordScope from "../../../shared/hooks/useRecordScope";
import { getEmbedUrl, isDirectVideo, safeHttpUrl } from "../../../shared/utils/resources";
import { PageSkeleton, PageState } from "../../../shared/components/ui";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { read, complete } from "../enrollment";
import styles from "./Enrollment.module.css";

function renderFormattedContent(text) {
  if (!text) {
    return <p className={styles.emptyContent}>No content available for this lesson.</p>;
  }

  return text.split(/\n\s*\n/).map((paragraph, index) => (
    <p key={index} className={styles.paragraph} style={{ whiteSpace: "pre-wrap" }}>
      {paragraph}
    </p>
  ));
}

function getResourceTitle(url, lessonTitle) {
  if (!url) return "External Resource";

  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace("www.", "");

    return `${lessonTitle || "Lesson"} Overview (${domain})`;
  } catch {
    return "External Resource Link";
  }
}

export default function Enrollment() {
  const { enrollmentId } = useParams();
  const authData = useAuth();

  const [enrollment, setEnrollment] = useState({
    course: { lessons: [] },
    lessonStatus: [],
  });
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const identity = `${enrollmentId}:${authData?.token}`;
  const capture = useRecordScope(identity);
  const [loadedIdentity, setLoadedIdentity] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    const isCurrent = capture();

    // oxlint-disable-next-line react/set-state-in-effect -- Reset stale content when starting a new asynchronous request.
    setLoading(true);
    setLoadError("");
    setLoadedIdentity(identity);
    setActiveLessonIndex(0);
    setError("");
    setSaving(false);

    read({ enrollmentId }, { t: authData.token }, abortController.signal).then((data) => {
      if (abortController.signal.aborted || !isCurrent()) return;
      if (data && !data.error) {
        setEnrollment(data);

        const firstIncomplete = (data.course?.lessons || []).findIndex(
          (lesson) =>
            !data.lessonStatus?.find((status) => String(status.lesson) === String(lesson._id))
              ?.complete,
        );

        if (firstIncomplete !== -1) {
          setActiveLessonIndex(firstIncomplete);
        } else {
          const totalLessons = data.course?.lessons?.length || data.lessonStatus?.length || 0;

          setActiveLessonIndex(Math.max(0, totalLessons - 1));
        }
      }
      if (!data || data.error) setLoadError(data?.error || "Unable to load this page.");

      setLoading(false);
    });

    return () => abortController.abort();
  }, [enrollmentId, authData, identity, capture]);

  if (loading || loadedIdentity !== identity) {
    return <PageSkeleton variant="classroom" label="Loading classroom" />;
  }
  if (loadError) return <PageState error message={loadError} />;

  const course = enrollment.course || { lessons: [] };
  const lessons = course.lessons || [];
  const lessonStatuses = enrollment.lessonStatus || [];

  const currentLesson = lessons[activeLessonIndex] || {};
  const currentStatus =
    lessonStatuses.find((status) => String(status.lesson) === String(currentLesson._id)) || {};

  const completedCount = lessons.filter(
    (lesson) =>
      lessonStatuses.find((status) => String(status.lesson) === String(lesson._id))?.complete,
  ).length;
  const progressPercentage =
    lessons.length > 0 ? Math.min(100, Math.round((completedCount / lessons.length) * 100)) : 0;

  const handleToggleComplete = async () => {
    if (saving || !currentStatus._id) return false;

    setSaving(true);
    setError("");

    const isCurrent = capture();

    const data = await complete(
      { enrollmentId },
      { t: authData.token },
      { lessonStatusId: currentStatus._id, complete: !currentStatus.complete },
    );

    if (!isCurrent()) return false;

    setSaving(false);

    if (data?.error) {
      setError(data.error);
      return false;
    }

    setEnrollment(data);
    return true;
  };

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextLesson = async () => {
    const isCurrent = capture();

    if (!currentStatus.complete) {
      if (!(await handleToggleComplete())) return;
    }
    if (!isCurrent()) return;
    if (activeLessonIndex < lessons.length - 1) {
      setActiveLessonIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!enrollment.course) {
    return <PageState message="This course is no longer available." />;
  }
  if (!lessons.length) {
    return <PageState message="Your instructor hasn't added lessons to this course yet." />;
  }

  const resourceUrl = safeHttpUrl(currentLesson.resource_url);
  const embedUrl = getEmbedUrl(resourceUrl);
  const isDirectVideoResource = isDirectVideo(resourceUrl);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/courses" className={styles.back}>
          <svg
            className={styles.backIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to courses</span>
        </Link>

        <div className={styles.grid}>
          <aside className={styles.sidebar}>
            <div className={styles.courseSummary}>
              <div className={styles.thumbnailWrap}>
                <CourseImage
                  loading="eager"
                  key={course._id}
                  src={course.image || "/course-image-fallback.svg"}
                  alt={course.name}
                  className={styles.thumbnail}
                />
              </div>

              <h2 className={styles.courseTitle}>{course.name}</h2>
              <div className={styles.instructor}>By {course.instructor?.name || "Instructor"}</div>

              <div className={styles.lessonsBadge}>
                <svg
                  className={styles.docIcon}
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

              <div className={styles.progress}>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className={styles.progressMeta}>
                  <span>
                    {completedCount} of {lessons.length} completed
                  </span>
                  <span>{progressPercentage}%</span>
                </div>
              </div>
            </div>

            <div className={styles.lessons}>
              {lessons.map((lesson, idx) => {
                const status =
                  lessonStatuses.find((item) => String(item.lesson) === String(lesson._id)) || {};
                const isActive = idx === activeLessonIndex;

                return (
                  <button
                    key={lesson._id || idx}
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setActiveLessonIndex(idx);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`${styles.lesson} ${isActive ? styles.lessonActive : ""}`}
                  >
                    <div className={styles.lessonLeft}>
                      <span className={styles.lessonNumber}>{idx + 1}.</span>
                      <span className={styles.lessonName}>{lesson.title}</span>
                    </div>
                    {status.complete && (
                      <svg
                        className={styles.lessonCheck}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-label="Completed"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <main className={styles.main}>
            {error && <p role="alert">{error}</p>}
            <div className={styles.eyebrow}>
              Lesson {activeLessonIndex + 1} of {lessons.length}
            </div>

            <h1 className={styles.lessonTitle}>{currentLesson.title}</h1>

            <div>{embedUrl ? <iframe src={embedUrl} title={currentLesson.title} allowFullScreen /> : isDirectVideoResource ? <video controls src={resourceUrl} /> : null}{renderFormattedContent(currentLesson.content)}{resourceUrl && <a href={resourceUrl} target="_blank" rel="noopener noreferrer">{getResourceTitle(resourceUrl, currentLesson.title)}</a>}</div>
            <div className={styles.navBar}>
              <button
                type="button"
                onClick={handlePrevLesson}
                disabled={saving || activeLessonIndex === 0}
                className={styles.previousButton}
                title="Previous lesson"
                aria-label="Previous lesson"
              >
                <svg
                  className={styles.navArrow}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>

              <div className={styles.navRight}>
                <button
                  type="button"
                  onClick={handleToggleComplete}
                  disabled={saving || !currentStatus._id}
                  className={`${styles.checkButton} ${currentStatus.complete ? styles.checkButtonActive : ""}`}
                  title={
                    currentStatus.complete ? "Click to mark incomplete" : "Click to mark complete"
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{currentStatus.complete ? "Completed" : "Mark as completed"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextLesson}
                  disabled={saving || activeLessonIndex >= lessons.length - 1}
                  className={styles.nextButton}
                  title="Next lesson"
                  aria-label="Next lesson"
                >
                  <svg
                    className={styles.navArrow}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
