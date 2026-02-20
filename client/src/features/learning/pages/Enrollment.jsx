import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { read } from "../enrollment";
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
      if (data?.error) setError(data.error); else setEnrollment(data);
    });
    return () => controller.abort();
  }, [enrollmentId, auth]);
  if (error) return <p role="alert">{error}</p>;
  if (!enrollment) return <p role="status">Loading classroom</p>;
  if (!enrollment.course) return <p>This course is no longer available.</p>;
  const lessons = enrollment.course.lessons || [];
  if (!lessons.length) return <p>Your instructor hasn't added lessons yet.</p>;
  const currentLesson = lessons[activeLessonIndex] || lessons[0];
  return <main><h1>{enrollment.course.name}</h1><nav aria-label="Lessons">{lessons.map((lesson, index) => <button key={lesson._id} onClick={() => setActiveLessonIndex(index)}>{lesson.title}</button>)}</nav><h2>{currentLesson.title}</h2><p style={{ whiteSpace: "pre-wrap" }}>{currentLesson.content}</p></main>;
}
