import { useState } from "react";
import { Link } from "react-router-dom";
import { create } from "../../users/user";
import { PageState } from "../../../shared/components/ui";
import styles from "./Signup.module.css";

export default function Signup() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    error: "",
    success: false,
    loading: false,
  });

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value, error: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValues({ ...values, loading: true, error: "" });

    const user = {
      name: values.name,
      email: values.email,
      password: values.password,
    };

    const data = await create(user);

    if (data.error) {
      setValues({ ...values, error: data.error, loading: false });
    } else {
      setValues({ ...values, success: true, loading: false });
    }
  };

  if (values.success)
    return (
      <PageState
        icon="success"
        title="Welcome to Acadexa"
        message="Your account has been created successfully. Use the Sign In link above to access your account."
      />
    );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create an Account</h1>
        <p className={styles.subtitle}>Start learning or teaching on Acadexa</p>

        {values.error && (
          <div role="alert" className={styles.error}>
            {values.error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="signup-field-1" className={styles.label}>
              Full Name
            </label>
            <input
              id="signup-field-1"
              type="text"
              className={styles.input}
              placeholder="Ada Lovelace"
              value={values.name}
              onChange={handleChange("name")}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signup-field-2" className={styles.label}>
              Email Address
            </label>
            <input
              id="signup-field-2"
              type="email"
              className={styles.input}
              placeholder="ada@example.com"
              value={values.email}
              onChange={handleChange("email")}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signup-field-3" className={styles.label}>
              Password
            </label>
            <input
              id="signup-field-3"
              type="password"
              className={styles.input}
              placeholder="Create a strong password"
              value={values.password}
              onChange={handleChange("password")}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={values.loading}
          >
            {values.loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link to="/signin" className={styles.link}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
