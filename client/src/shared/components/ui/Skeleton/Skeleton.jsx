import styles from "./Skeleton.module.css";

export default function Skeleton({ width, height, className = "", ...props }) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.block} ${className}`}
      style={{ width, height }}
      {...props}
    />
  );
}

