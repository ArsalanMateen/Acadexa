import useRecordScope from "../../../shared/hooks/useRecordScope";
import { PageSkeleton, PageState } from "../../../shared/components/ui";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import auth, { useAuth } from "../../../shared/session/auth-helper";
import { read, remove } from "../user";
import styles from "./Profile.module.css";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const authData = useAuth();
  const identity = `${userId}:${authData.token}`;
  const capture = useRecordScope(identity);
  const [loadedIdentity, setLoadedIdentity] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    const isCurrent = capture();
    // oxlint-disable-next-line react/set-state-in-effect -- Reset stale content when starting a new asynchronous request.
    setLoading(true);
    setLoadError("");
    setLoadedIdentity(identity);

    const signal = abortController.signal;
    const jwt = auth.isAuthenticated();

    read({ userId }, { t: jwt.token }, signal).then((data) => {
      if (abortController.signal.aborted || !isCurrent()) return;
      if (data.error) {
        console.error(data.error);
        setLoadError(data.error);
      } else {
        setUser(data);
      }

      setLoading(false);
    });

    return () => abortController.abort();
  }, [userId, authData, identity, capture]);

  const handleDelete = () => {
    if (
      window.confirm(
        "Delete your account, enrollments, and any courses you teach? Learners will lose access to those courses. This cannot be undone.",
      )
    ) {
      const jwt = auth.isAuthenticated();
      const isCurrent = capture();

      remove({ userId }, { t: jwt.token }).then((data) => {
        if (!isCurrent()) return;
        if (data.error) {
          alert(data.error);
        } else {
          auth.clearJWT(() => navigate("/"));
        }
      });
    }
  };

  if (loading || loadedIdentity !== identity) {
    return <PageSkeleton variant="profile" label="Loading profile" />;
  }
  if (loadError)
    return (
      <PageState
        error
        title="Profile unavailable"
        message={loadError}
      />
    );

  const isOwner = authData.user._id === user._id;
  const joinedDate = user.created
    ? new Date(user.created).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{user.name}</h1>
              <span
                className={
                  user.instructor ? styles.badgeInstructor : styles.badgeStudent
                }
              >
                {user.instructor ? "Instructor" : "Student"}
              </span>
            </div>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Role</span>
            <span className={styles.detailValue}>
              {user.instructor ? "Instructor" : "Student"}
            </span>
          </div>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Member since</span>
            <span className={styles.detailValue}>{joinedDate}</span>
          </div>
        </div>

        {isOwner && (
          <div className={styles.actions}>
            <Link to={`/user/edit/${user._id}`} className={styles.editButton}>
              Edit Profile
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className={styles.deleteButton}
            >
              Delete Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
