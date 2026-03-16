import useRecordScope from "../../../shared/hooks/useRecordScope";
import { PageSkeleton, PageState } from "../../../shared/components/ui";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import auth, { useAuth } from "../../../shared/session/auth-helper";
import { read, update } from "../user";
import styles from "./EditProfile.module.css";

export default function EditProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState("");
  const authData = useAuth();
  const identity = `${userId}:${authData?.token}`;
  const capture = useRecordScope(identity);
  const [loadedIdentity, setLoadedIdentity] = useState(null);
  const [values, setValues] = useState({
    name: "",
    email: "",
    instructor: false,
    error: "",
    loading: false,
  });

  useEffect(() => {
    const abortController = new AbortController();
    const isCurrent = capture();
    const signal = abortController.signal;
    const jwt = auth.isAuthenticated();

    // oxlint-disable-next-line react/set-state-in-effect -- Reset stale content when starting a new asynchronous request.
    setFetching(true);
    setValues({ name: "", email: "", instructor: false, error: "", loading: false });
    setLoadError("");
    setLoadedIdentity(identity);

    read({ userId }, { t: jwt.token }, signal).then((data) => {
      if (abortController.signal.aborted || !isCurrent()) return;

      setFetching(false);

      if (data?.error || data?._id !== jwt.user._id) {
        setLoadError(data?.error || "You can only edit your own profile.");
        setValues((v) => ({ ...v, error: data?.error }));
      } else if (data) {
        setValues((v) => ({
          ...v,
          name: data.name,
          email: data.email,
          instructor: Boolean(data.instructor),
        }));
      }
    });

    return () => abortController.abort();
  }, [userId, authData, identity, capture]);

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value, error: "" });
  };

  const handleCheck = (event) => {
    setValues({ ...values, instructor: event.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValues({ ...values, loading: true, error: "" });

    const jwt = auth.isAuthenticated();
    const user = {
      name: values.name || undefined,
      email: values.email || undefined,
      instructor: values.instructor,
    };

    const isCurrent = capture();

    const data = await update({ userId }, { t: jwt.token }, user);

    if (!isCurrent()) return;
    if (data && data.error) {
      setValues({ ...values, error: data?.error, loading: false });
    } else {
      auth.updateUser({ ...data, instructor: values.instructor }, () => {
        navigate(`/user/${userId}`);
      });
    }
  };

  if (fetching || loadedIdentity !== identity) {
    return <PageSkeleton variant="profile" label="Loading profile editor" />;
  }
  if (loadError) return <PageState error message={loadError} />;

  return (<main className={styles.page}><h1>Edit profile</h1>{values.error && <p role="alert">{values.error}</p>}<form onSubmit={handleSubmit}>{["name", "email"].map(field => <label key={field}>{field}<input value={values[field]} onChange={handleChange(field)} required /></label>)}<label><input type="checkbox" checked={values.instructor} onChange={handleCheck} />I am an instructor</label><button disabled={values.loading}>Save</button></form></main>);
}
