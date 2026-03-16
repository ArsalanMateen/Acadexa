import CourseImage from "../../../shared/components/CourseImage";
import { Link } from "react-router-dom";
import styles from "./CourseCard.module.css";

export default function CourseCard({ course }) {
  const lessonsCount = course.lessonCount;
  const instructorName = course.instructor.name;

  return (
    <Link to={`/course/${course._id}`} className={styles.card}>
      <div className={styles.thumbnail}>
        <CourseImage
          loading="lazy"
          key={course._id}
          src={course.image}
          alt={course.name}
          className={styles.thumbnailImage}
        />
      </div>

      <div className={styles.body}>
        <span className={styles.category}>{course.category}</span>

        <h3 className={styles.title}>{course.name}</h3>

        <p className={styles.instructor}>By {instructorName}</p>

        {course.description && (
          <p className={styles.description}>{course.description}</p>
        )}

        <div className={styles.footer}>
          <div className={styles.meta}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>
              {lessonsCount} {lessonsCount === 1 ? "lesson" : "lessons"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
