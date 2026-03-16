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

  return (<main className={styles.page}><h1>{course.name}</h1><nav aria-label="Lessons">{lessons.map((lesson, idx) => <button key={lesson._id} disabled={saving} onClick={() => setActiveLessonIndex(idx)}>{lesson.title}</button>)}</nav><h2>{currentLesson.title}</h2>{embedUrl ? <iframe src={embedUrl} title={currentLesson.title} allowFullScreen /> : isDirectVideoResource ? <video src={resourceUrl} controls /> : null}{renderFormattedContent(currentLesson.content)}{resourceUrl && <a href={resourceUrl} target="_blank" rel="noopener noreferrer">{getResourceTitle(resourceUrl, currentLesson.title)}</a>}<p>{completedCount} of {lessons.length} completed ({progressPercentage}%)</p>{error && <p role="alert">{error}</p>}<button onClick={handlePrevLesson} disabled={saving || activeLessonIndex === 0}>Previous</button><button onClick={handleToggleComplete} disabled={saving || !currentStatus._id}>{currentStatus.complete ? "Completed" : "Mark completed"}</button><button onClick={handleNextLesson} disabled={saving || activeLessonIndex >= lessons.length - 1}>Next</button></main>);
}
