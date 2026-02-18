import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
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
  return <main><h1>Edit course</h1>{error && <p role="alert">{error}</p>}<form onSubmit={save}>{["name", "description", "category"].map(field => <label key={field}>{field}<input value={course[field] || ""} onChange={event => setCourse({ ...course, [field]: event.target.value })} /></label>)}<label><input type="checkbox" checked={course.published} onChange={event => setCourse({ ...course, published: event.target.checked })} />Published</label><button disabled={saving}>Save</button></form></main>;
}
