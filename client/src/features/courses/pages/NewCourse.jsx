import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { categories } from "../categories";
import { create } from "../course";

export default function NewCourse() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", description: "", category: categories[0], published: false });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async event => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    const form = new FormData();
    for (const field of ["name", "description", "category", "published"]) form.append(field, values[field]);
    const data = await create({ userId: auth.user._id }, { t: auth.token }, form);
    if (data?.error) { setError(data.error); setSaving(false); }
    else navigate(`/teach/course/edit/${data._id}`);
  };
  return <main><h1>Create course</h1>{error && <p role="alert">{error}</p>}<form onSubmit={submit}><label>Title<input value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} required /></label><label>Description<textarea value={values.description} onChange={event => setValues({ ...values, description: event.target.value })} /></label><label>Category<select value={values.category} onChange={event => setValues({ ...values, category: event.target.value })}>{categories.map(category => <option key={category}>{category}</option>)}</select></label><button disabled={saving}>{saving ? "Creating..." : "Create"}</button></form></main>;
}
