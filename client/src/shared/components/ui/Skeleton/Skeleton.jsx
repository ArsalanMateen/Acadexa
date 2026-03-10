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

export function CourseSkeletons({ count = 6, className = "" }) {
  return (
    <div
      className={`${styles.grid} ${className}`}
      role="status"
      aria-label="Loading courses"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.card} key={index} aria-hidden="true">
          <Skeleton className={styles.image} />
          <div className={styles.body}>
            <Skeleton width="30%" />
            <Skeleton height="24px" width="80%" />
            <Skeleton width="50%" />
            <Skeleton />
            <Skeleton width="65%" />
          </div>
        </div>
      ))}
    </div>
  );
}

