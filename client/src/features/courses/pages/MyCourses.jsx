import useRecordScope from "../../../shared/hooks/useRecordScope";
import CourseImage from "../../../shared/components/CourseImage";
import {
  CourseSkeletons,
  Skeleton,
  PageState,
} from "../../../shared/components/ui";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { listByInstructor } from "../course";
import { enrollmentStatsByInstructor } from "../../learning/enrollment";
import { validStats } from "../enrollmentState";
import styles from "./MyCourses.module.css";

function CourseCardWithStats({ course, stats, statsLoading }) {
  const counts = validStats(stats)
    ? stats
    : { totalEnrolled: "—", totalCompleted: "—" };
  const lessons = course.lessons;

  return (
    <div className={styles.card}>
      <CourseImage
        loading="lazy"
        key={course._id}
        src={course.image}
        alt={course.name}
        className={styles.cardImage}
      />
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <span className={styles.cardCategory}>
            {course.category}
          </span>
          {course.published ? (
            <span className={styles.badgePublished}>Published</span>
          ) : (
            <span className={styles.badgeDraft}>Draft</span>
          )}
        </div>

        <h3 className={styles.cardName}>{course.name}</h3>
        <p className={styles.cardDescription}>{course.description}</p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {!statsLoading ? (
                counts.totalEnrolled
              ) : (
                <Skeleton width="32px" height="22px" />
              )}
            </span>
            <span className={styles.statLabel}>Enrolled</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {!statsLoading ? (
                counts.totalCompleted
              ) : (
                <Skeleton width="32px" height="22px" />
              )}
            </span>
            <span className={styles.statLabel}>Completed</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>{lessons.length}</span>
            <span className={styles.statLabel}>
              {lessons.length === 1 ? "Lesson" : "Lessons"}
            </span>
          </div>
        </div>

        <div className={styles.cardActions}>
          <Link
            to={`/teach/course/edit/${course._id}`}
            className={styles.outlineButton}
          >
            Edit Course
          </Link>
          <Link to={`/course/${course._id}`} className={styles.filledButton}>
            Preview
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statsByCourse, setStatsByCourse] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const authData = useAuth();
  const identity = `${authData.user._id}:${authData.token}`;
  const capture = useRecordScope(identity);
  const [loadedIdentity, setLoadedIdentity] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    const isCurrent = capture();
    const signal = abortController.signal;
    // oxlint-disable-next-line react/set-state-in-effect -- Reset stale content when starting a new asynchronous request.
    setLoading(true);
    setError("");
    setLoadedIdentity(identity);
    setStatsByCourse({});
    setStatsLoading(true);
    setStatsError("");

    enrollmentStatsByInstructor({ t: authData.token }, signal).then((data) => {
      if (signal.aborted || !isCurrent()) return;
      if (data.error) {
        setStatsError(data.error);
      } else if (typeof data !== "object" || Array.isArray(data)) {
        setStatsError("Enrollment statistics are unavailable.");
      } else {
        setStatsByCourse(data);
      }

      setStatsLoading(false);
    });
    listByInstructor(
      { userId: authData.user._id },
      { t: authData.token },
      signal,
    ).then((data) => {
      if (abortController.signal.aborted || !isCurrent()) return;
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        setError(data.error);
      }

      setLoading(false);
    });

    return () => abortController.abort();
  }, [authData, identity, capture]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>My Courses</h1>
              <Link
                to="/teach/course/new"
                className={styles.addButton}
                aria-label="Create course"
                title="Create course"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.plusIcon}
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </Link>
            </div>
            <p className={styles.subtitle}>
              Manage your published courses, curriculum lessons, and monitor
              learner progress.
            </p>
          </div>

          {statsError && !loading && loadedIdentity === identity && !error && (
            <p role="alert">{statsError}</p>
          )}
          {loading || loadedIdentity !== identity ? (
            <CourseSkeletons className={styles.grid} />
          ) : error ? (
            <PageState
              error
              title="Unable to load courses"
              message={error}
            />
          ) : courses.length === 0 ? (
            <PageState
              icon="teach"
              title="Create your first course"
              message="Share your expertise with learners worldwide. Structure your lessons, add video lectures, and track student enrollment."
            />
          ) : (
            <div className={styles.grid}>
              {courses.map((course) => (
                <CourseCardWithStats
                  key={course._id}
                  course={course}
                  stats={statsByCourse[String(course._id)]}
                  statsLoading={statsLoading}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
