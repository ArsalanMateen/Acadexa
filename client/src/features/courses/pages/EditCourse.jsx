import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { safeHttpUrl } from "../../../shared/utils/resources";
import { read, update } from "../course";

export default function EditCourse() {
  const { courseId } = useParams();
  const auth = useAuth();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    read({ courseId }, controller.signal, { t: auth.token }).then(data => {
      if (controller.signal.aborted) return;
      if (data?.error || data?.instructor?._id !== auth.user._id) setError(data?.error || "You can only edit your own courses.");
      else setCourse(data);
    });
    return () => controller.abort();
  }, [courseId, auth]);
  const [lesson, setLesson] = useState({ title: "", content: "", resource_url: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const saveLessons = async lessons => {
    if (saving) return;
    setSaving(true);
    const form = new FormData();
    form.append("lessons", JSON.stringify(lessons));
    const data = await update({ courseId }, { t: auth.token }, form);
    if (data?.error) setError(data.error); else { setCourse(data); setLesson({ title: "", content: "", resource_url: "" }); setEditingIndex(null); }
    setSaving(false);
  };
  const addLesson = event => {
    event.preventDefault();
    if (!lesson.title.trim()) { setError("Lesson title is required."); return; }
    if (lesson.resource_url && !safeHttpUrl(lesson.resource_url)) { setError("Resource URL must start with http:// or https://"); return; }
    const lessons = [...course.lessons];
    if (editingIndex === null) lessons.push(lesson);
    else lessons[editingIndex] = { ...lessons[editingIndex], ...lesson };
    return saveLessons(lessons);
  };
  const save = async event => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    const form = new FormData();
    for (const field of ["name", "description", "category", "published"]) form.append(field, course[field]);
    const data = await update({ courseId }, { t: auth.token }, form);
    if (data?.error) setError(data.error); else setCourse(data);
    setSaving(false);
  };
  if (!course) return <p role={error ? "alert" : "status"}>{error || "Loading course editor"}</p>;
  return <main><h1>Edit course</h1>{error && <p role="alert">{error}</p>}<form onSubmit={save}>{["name", "description", "category"].map(field => <label key={field}>{field}<input value={course[field] || ""} onChange={event => setCourse({ ...course, [field]: event.target.value })} /></label>)}<label><input type="checkbox" checked={course.published} onChange={event => setCourse({ ...course, published: event.target.checked })} />Published</label><button disabled={saving}>Save</button></form><section><h2>Lessons</h2><ol>{course.lessons.map((item, index) => <li key={item._id}>{item.title}<button type="button" disabled={saving} onClick={() => { setLesson({ title: item.title, content: item.content || "", resource_url: item.resource_url || "" }); setEditingIndex(index); }}>Edit</button><button type="button" disabled={saving} onClick={() => window.confirm("Remove this lesson from curriculum?") && saveLessons(course.lessons.filter((_, i) => i !== index))}>Delete</button></li>)}</ol><form onSubmit={addLesson}>{["title", "content", "resource_url"].map(field => <label key={field}>{field}<input value={lesson[field]} onChange={event => setLesson({ ...lesson, [field]: event.target.value })} /></label>)}<button disabled={saving}>{editingIndex === null ? "Add lesson" : "Update lesson"}</button></form></section></main>;
}
