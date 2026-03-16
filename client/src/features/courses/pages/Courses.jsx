import useCourseCatalog from "../useCourseCatalog";
import LoadBoundary from "../components/LoadBoundary";
import heroImg from "../../../assets/course-catalog-hero.png";
import CourseCard from "../components/CourseCard";
import {
  CourseSkeletons,
  Skeleton,
  PageState,
} from "../../../shared/components/ui";
import styles from "./Courses.module.css";

export default function Courses() {
  const page = useCourseCatalog();
  const { courses, totalCount, loading, error } = page;

  return (
    <div className={styles.page}>
      <section className={styles.banner}>
        <div className={styles.bannerInner}>
          <div className={styles.bannerContent}>
            <span className={styles.label}>COURSES</span>
            <h1 className={styles.title}>
              Learn from experienced
              <br />
              instructors
            </h1>
            <p className={styles.subtitle}>
              Explore published courses, gain practical skills, and learn at
              your own pace with step-by-step lessons.
            </p>
          </div>

          <div className={styles.bannerVisual}>
            <div className={styles.bannerImageWrap}>
              <img
                src={heroImg}
                alt="Workspace with books, laptop and plant"
                loading="eager"
                decoding="sync"
                fetchPriority="high"
                className={styles.bannerImage}
              />
            </div>
          </div>
        </div>
      </section>
      <div className={styles.main}>
        <div className={styles.catalogHeader}>
          <h2 className={styles.catalogTitle}>Published courses</h2>
          {loading ? (
            <Skeleton width="72px" />
          ) : (
            !error && (
              <span className={styles.courseCount}>
                {totalCount} {totalCount === 1 ? "course" : "courses"}
              </span>
            )
          )}
        </div>
        {loading ? (
          <CourseSkeletons count={8} className={styles.grid} />
        ) : error ? (
          <PageState error title="Unable to load courses" message={error} />
        ) : courses.length === 0 ? (
          <PageState
            icon="catalog"
            title="No courses published yet"
            message="Instructors are preparing new curricula. Check back soon for fresh courses and learning tracks."
          />
        ) : (
          <>
            <div className={styles.grid}>
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
            <LoadBoundary page={page} className={styles.progress} />
          </>
        )}
      </div>
    </div>
  );
}
