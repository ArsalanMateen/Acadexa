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

export function PageSkeleton({ variant = "detail", label = "Loading page" }) {
  return (
    <div
      className={`${styles.page} ${variant === "profile" ? styles.compact : ""}`}
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <Skeleton width="25%" height="20px" />
      <div
        className={variant === "classroom" ? styles.classroom : styles.detail}
        aria-hidden="true"
      >
        <div className={styles.panel}>
          {variant !== "profile" && <Skeleton className={styles.image} />}
          <Skeleton width="70%" height="32px" />
          <Skeleton width="40%" />
          <Skeleton />
          <Skeleton width="80%" />
        </div>
        <div className={styles.panel}>
          {Array.from({ length: variant === "form" ? 6 : 4 }, (_, index) => (
            <Skeleton key={index} height="44px" />
          ))}
        </div>
      </div>
    </div>
  );
}
