import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { read } from "../user";

export default function Profile() {
  const { userId } = useParams();
  const auth = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    read({ userId }, { t: auth.token }, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (data?.error) setError(data.error); else setUser(data);
    });
    return () => controller.abort();
  }, [userId, auth]);
  if (error) return <p role="alert">{error}</p>;
  if (!user) return <p role="status">Loading profile</p>;
  return <main><h1>{user.name}</h1><p>{user.email}</p><p>{user.instructor ? "Instructor" : "Student"}</p>{auth.user._id === user._id && <Link to={`/user/edit/${user._id}`}>Edit profile</Link>}</main>;
}
