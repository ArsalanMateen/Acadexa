import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import auth, { useAuth } from "../../../shared/session/auth-helper";
import { read, update } from "../user";

export default function EditProfile() {
  const { userId } = useParams();
  const session = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    read({ userId }, { t: session.token }, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (data?.error || data?._id !== session.user._id) setError(data?.error || "You can only edit your own profile.");
      else setValues(data);
    });
    return () => controller.abort();
  }, [userId, session]);
  const save = async event => {
    event.preventDefault();
    const result = await update({ userId }, { t: session.token }, values);
    if (result?.error) setError(result.error);
    else auth.updateUser(result, () => navigate(`/user/${userId}`));
  };
  if (error) return <p role="alert">{error}</p>;
  if (!values) return <p role="status">Loading profile editor</p>;
  return <main><h1>Edit profile</h1><form onSubmit={save}>{["name", "email"].map(field => <label key={field}>{field}<input value={values[field]} onChange={event => setValues({ ...values, [field]: event.target.value })} required /></label>)}<label><input type="checkbox" checked={Boolean(values.instructor)} onChange={event => setValues({ ...values, instructor: event.target.checked })} />I am an instructor</label><button>Save</button></form></main>;
}
