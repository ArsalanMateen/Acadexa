import styles from "./Spinner.module.css";

const sizeClassNames = {
  "size-sm": "sizeSmall",
  "size-md": "sizeMedium",
  "size-lg": "sizeLarge",
};

export default function Spinner({ size = "md", className = "", ...props }) {
  return (
    <div
      className={`${styles.spinner} ${styles[sizeClassNames[`size-${size}`]]} ${className}`.trim()}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}
