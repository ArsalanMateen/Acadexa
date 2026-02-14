import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import auth from "../../../shared/session/auth-helper";
import { signin } from "../auth";
import styles from "./Signin.module.css";

export default function Signin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({
    email: "",
    password: "",
    error: "",
    loading: false,
  });

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value, error: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValues({ ...values, loading: true, error: "" });

    const user = {
      email: values.email || undefined,
      password: values.password || undefined,
    };

    const data = await signin(user);

    if (data.error) {
      setValues({ ...values, error: data.error, loading: false });
    } else {
      auth.authenticate(data, () => {
        const from = location.state?.from?.pathname || "/";

        navigate(from, { replace: true });
      });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your Acadexa account</p>

        {values.error && (
          <div role="alert" className={styles.error}>
            {values.error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="signin-field-1" className={styles.label}>
              Email Address
            </label>
            <input
              id="signin-field-1"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange("email")}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signin-field-2" className={styles.label}>
              Password
            </label>
            <input
              id="signin-field-2"
              type="password"
              className={styles.input}
              placeholder="Enter your password"
              value={values.password}
              onChange={handleChange("password")}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={values.loading}>
            {values.loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{" "}
          <Link to="/signup" className={styles.link}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
