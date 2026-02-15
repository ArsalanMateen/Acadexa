import { Link, useNavigate } from "react-router-dom";
import auth, { useAuth } from "../../shared/session/auth-helper";
import { signout } from "../../features/auth/auth";

export default function Navbar() {
  const user = useAuth();
  const navigate = useNavigate();
  const logout = () => signout().then(() => auth.clearJWT(() => navigate("/")));
  return <nav aria-label="Main navigation"><Link to="/">Acadexa</Link> {user ? <><Link to={`/user/${user.user._id}`}>Profile</Link><button onClick={logout}>Sign out</button></> : <><Link to="/signin">Sign in</Link> <Link to="/signup">Create account</Link></>}</nav>;
}
