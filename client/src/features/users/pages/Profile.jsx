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
  const identity = `${userId}:${authData?.token}`;
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
      if (data && data.error) {
        console.error(data.error);
      } else if (data) {
        setUser(data);
      }
      if (!data || data.error) setLoadError(data?.error || "Unable to load this page.");

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
        if (data && data.error) {
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
  if (loadError) return <PageState error message={loadError} />;

  const isOwner = auth.isAuthenticated()?.user?._id === user._id;
  const joinedDate = user.created
    ? new Date(user.created).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (<main className={styles.page}><h1>{user.name}</h1><p>{user.email}</p><p>{user.instructor ? "Instructor" : "Student"}</p>{isOwner && <><Link to={`/user/edit/${user._id}`}>Edit profile</Link><button onClick={handleDelete}>Delete account</button></>}</main>);
}
