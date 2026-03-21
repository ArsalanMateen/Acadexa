import { useId } from "react";
import styles from "./Input.module.css";

export default function Input({
  label,
  error,
  id,
  type = "text",
  className = "",
  containerClassName = "",
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`${styles.container} ${containerClassName}`.trim()}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`${styles.input} ${error ? styles.inputError : ""} ${className}`.trim()}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} role="alert" className={styles.errorText}>
          {error}
        </span>
      )}
    </div>
  );
}
