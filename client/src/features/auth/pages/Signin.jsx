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
      email: values.email,
      password: values.password,
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

  const loginAsDemo = async (email) => {
    const user = {
      email,
      password: "password",
    };

    setValues((prev) => ({
      ...prev,
      email: user.email,
      password: user.password,
      loading: true,
      error: "",
    }));

    const data = await signin(user);

    if (data.error) {
      setValues((prev) => ({ ...prev, error: data.error, loading: false }));
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
              value={values.password}
              onChange={handleChange("password")}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={values.loading}
          >
            {values.loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerLine}></span>
          <span className={styles.dividerText}>or</span>
          <span className={styles.dividerLine}></span>
        </div>

        <div className={styles.demo}>
          <span className={styles.demoText}>Sign in as </span>
          <button
            type="button"
            className={styles.demoButton}
            disabled={values.loading}
            onClick={() => loginAsDemo("student@acadexa.dev")}
            title="Student demo account"
          >
            Alex Rivera
          </button>
          <span className={styles.demoText}> or </span>
          <button
            type="button"
            className={styles.demoButton}
            disabled={values.loading}
            onClick={() => loginAsDemo("angela.yu@acadexa.dev")}
            title="Instructor demo account"
          >
            Dr. Angela Yu
          </button>
        </div>

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
