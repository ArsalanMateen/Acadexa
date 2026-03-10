import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import authHelper from "../../../shared/session/auth-helper";
import { useNavigate } from "react-router-dom";
import { read, remove } from "../user";

export default function Profile() {
  const navigate = useNavigate();
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
  return <main><h1>{user.name}</h1><p>{user.email}</p><p>{user.instructor ? "Instructor" : "Student"}</p>{auth.user._id === user._id && <Link to={`/user/edit/${user._id}`}>Edit profile</Link>}{auth.user._id === user._id && <button onClick={async () => { if (!window.confirm("Delete your account, enrollments, and courses?")) return; const data = await remove({ userId }, { t: auth.token }); if (data?.error) setError(data.error); else authHelper.clearJWT(() => navigate("/")); }}>Delete account</button>}</main>;
}
