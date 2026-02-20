import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { read, complete } from "../enrollment";
export default function Enrollment() {
  const { enrollmentId } = useParams();
  const auth = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    read({ enrollmentId }, { t: auth.token }, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (data?.error) setError(data.error); else {
        setEnrollment(data);
        const first = (data.course?.lessons || []).findIndex(lesson => !data.lessonStatus?.find(status => String(status.lesson) === String(lesson._id))?.complete);
        setActiveLessonIndex(first >= 0 ? first : Math.max(0, (data.course?.lessons.length || 1) - 1));
      }
    });
    return () => controller.abort();
  }, [enrollmentId, auth]);
  const [saving, setSaving] = useState(false);
  const markComplete = async () => {
    if (saving) return;
    const status = enrollment.lessonStatus.find(item => String(item.lesson) === String(enrollment.course.lessons[activeLessonIndex]._id));
    if (!status) return;
    setSaving(true);
    const data = await complete({ enrollmentId }, { t: auth.token }, { lessonStatusId: status._id, complete: !status.complete });
    if (data?.error) setError(data.error); else setEnrollment(data);
    setSaving(false);
  };
  if (error) return <p role="alert">{error}</p>;
  if (!enrollment) return <p role="status">Loading classroom</p>;
  if (!enrollment.course) return <p>This course is no longer available.</p>;
  const lessons = enrollment.course.lessons || [];
  if (!lessons.length) return <p>Your instructor hasn't added lessons yet.</p>;
  const currentLesson = lessons[activeLessonIndex] || lessons[0];
  return <main><h1>{enrollment.course.name}</h1><nav aria-label="Lessons">{lessons.map((lesson, index) => <button key={lesson._id} onClick={() => setActiveLessonIndex(index)}>{lesson.title}</button>)}</nav><h2>{currentLesson.title}</h2><p style={{ whiteSpace: "pre-wrap" }}>{currentLesson.content}</p><button disabled={saving} onClick={markComplete}>Toggle completion</button></main>;
}
