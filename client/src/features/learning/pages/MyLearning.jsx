import CourseImage from "../../../shared/components/CourseImage";
import { CourseSkeletons, PageState } from "../../../shared/components/ui";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { listEnrolled } from "../enrollment";
import styles from "./MyLearning.module.css";

export default function MyLearning() {
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authData = useAuth();

  useEffect(() => {
    const abortController = new AbortController();
    // oxlint-disable-next-line react/set-state-in-effect -- Reset stale content when starting a new asynchronous request.
    setLoading(true);
    setError("");

    listEnrolled({ t: authData.token }, abortController.signal).then((data) => {
      if (abortController.signal.aborted) return;
      if (Array.isArray(data)) {
        setEnrolled(data.filter((item) => item.course));
      } else {
        setError(data.error);
      }

      setLoading(false);
    });

    return () => abortController.abort();
  }, [authData]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>My Learning</h1>
            <p className={styles.subtitle}>
              Continue learning and track your progress across enrolled courses.
            </p>
          </div>
        </header>

        {loading ? (
          <CourseSkeletons className={styles.grid} />
        ) : error ? (
          <PageState
            error
            title="Unable to load enrolled courses"
            message={error}
          />
        ) : enrolled.length === 0 ? (
          <PageState
            icon="learn"
            title="Start your learning journey"
            message="You haven't enrolled in any courses yet. Browse our catalog to discover topics that interest you and begin building your skills."
          />
        ) : (
          <div className={styles.grid}>
            {enrolled.map((item) => {
              const course = item.course;
              const lessons = course.lessons;
              const totalLessons = lessons.length;
              const completedCount = item.lessonStatus.filter(
                (l) => l.complete,
              ).length;
              const percentage =
                totalLessons > 0
                  ? Math.min(
                      100,
                      Math.round((completedCount / totalLessons) * 100),
                    )
                  : 0;

              return (
                <Link
                  key={item._id}
                  to={`/learn/${item._id}`}
                  className={styles.card}
                >
                  <div className={styles.thumbnailWrap}>
                    <CourseImage
                      loading="lazy"
                      key={course._id}
                      src={course.image}
                      alt={course.name}
                      className={styles.thumbnail}
                    />
                  </div>

                  <div className={styles.cardBody}>
                    <span className={styles.cardCategory}>
                      {course.category}
                    </span>

                    <h2 className={styles.cardName}>{course.name}</h2>

                    <p className={styles.cardInstructor}>
                      By {course.instructor.name}
                    </p>

                    <div className={styles.progress}>
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className={styles.progressMeta}>
                        <span>
                          {completedCount} of {totalLessons} lessons
                        </span>
                        <span>{percentage}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
