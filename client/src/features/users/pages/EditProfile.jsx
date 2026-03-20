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
  const identity = `${userId}:${authData.token}`;
  const capture = useRecordScope(identity);
  const [loadedIdentity, setLoadedIdentity] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
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
    setInitialValues(null);
    setValues({
      name: "",
      email: "",
      instructor: false,
      error: "",
      loading: false,
    });
    setLoadError("");
    setLoadedIdentity(identity);

    read({ userId }, { t: jwt.token }, signal).then((data) => {
      if (abortController.signal.aborted || !isCurrent()) return;

      setFetching(false);

      if (data.error) {
        setLoadError(data.error);
        setValues((v) => ({ ...v, error: data.error }));
      } else if (data._id !== jwt.user._id) {
        setLoadError("You can only edit your own profile.");
      } else {
        const loaded = {
          name: data.name || "",
          email: data.email || "",
          instructor: Boolean(data.instructor),
        };
        setInitialValues(loaded);
        setValues((v) => ({
          ...v,
          ...loaded,
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

  const isDirty =
    Boolean(initialValues) &&
    Boolean(values.name.trim()) &&
    Boolean(values.email.trim()) &&
    (values.name !== initialValues.name ||
      values.email !== initialValues.email ||
      values.instructor !== initialValues.instructor);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (values.loading || !isDirty) return;
    setValues({ ...values, loading: true, error: "" });

    const jwt = auth.isAuthenticated();
    const user = {
      name: values.name,
      email: values.email,
      instructor: values.instructor,
    };

    const isCurrent = capture();

    const data = await update({ userId }, { t: jwt.token }, user);

    if (!isCurrent()) return;
    if (data.error) {
      setValues({ ...values, error: data.error, loading: false });
    } else {
      auth.updateUser({ ...data, instructor: values.instructor }, () => {
        navigate(`/user/${userId}`);
      });
    }
  };

  if (fetching || loadedIdentity !== identity) {
    return <PageSkeleton variant="profile" label="Loading profile editor" />;
  }
  if (loadError)
    return (
      <PageState
        error
        title="Unable to load profile editor"
        message={loadError}
      />
    );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Edit Profile</h1>
        <p className={styles.subtitle}>Update your profile details and role</p>

        {values.error && (
          <div role="alert" className={styles.error}>
            {values.error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="editprofile-field-1" className={styles.label}>
              Full Name
            </label>
            <input
              id="editprofile-field-1"
              type="text"
              className={styles.input}
              value={values.name}
              onChange={handleChange("name")}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="editprofile-field-2" className={styles.label}>
              Email Address
            </label>
            <input
              id="editprofile-field-2"
              type="email"
              className={styles.input}
              value={values.email}
              onChange={handleChange("email")}
              required
            />
          </div>

          <div className={styles.switchWrap}>
            <div>
              <span className={styles.switchLabel}>I am an Instructor</span>
              <span className={styles.switchSubtext}>
                Enables course authoring, curriculum management, and student
                analytics
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                aria-label="I am an instructor"
                checked={values.instructor}
                onChange={handleCheck}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={values.loading || !isDirty}
            >
              {values.loading ? "Saving..." : "Save"}
            </button>
            <Link to={`/user/${userId}`} className={styles.cancelButton}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
