import useRecordScope from "../../../shared/hooks/useRecordScope";
import CourseImage from "../../../shared/components/CourseImage";
import { CourseSkeletons, Skeleton, PageState } from "../../../shared/components/ui";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { listByInstructor } from "../course";
import { enrollmentStatsByInstructor } from "../../learning/enrollment";
import { validStats } from "../enrollmentState";
import styles from "./MyCourses.module.css";

function CourseCardWithStats({ course, stats, statsLoading }) {
  const counts = validStats(stats) ? stats : { totalEnrolled: "—", totalCompleted: "—" };
  return <article><h2>{course.name}</h2><p>{course.published ? "Published" : "Draft"}</p><p>{statsLoading ? "Loading statistics" : `${counts.totalEnrolled} enrolled, ${counts.totalCompleted} completed`}</p><Link to={`/teach/course/edit/${course._id}`}>Edit course</Link> <Link to={`/course/${course._id}`}>Preview</Link></article>;
}

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statsByCourse, setStatsByCourse] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const authData = useAuth();
  const identity = `${authData?.user._id}:${authData?.token}`;
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

    if (authData) {
      enrollmentStatsByInstructor({ t: authData.token }, signal).then((data) => {
        if (signal.aborted || !isCurrent()) return;
        if (
          !data ||
          data.error ||
          data.aborted ||
          typeof data !== "object" ||
          Array.isArray(data)
        ) {
          setStatsError(data?.error || "Enrollment statistics are unavailable.");
        } else setStatsByCourse(data);

        setStatsLoading(false);
      });
      listByInstructor({ userId: authData.user._id }, { t: authData.token }, signal).then(
        (data) => {
          if (abortController.signal.aborted || !isCurrent()) return;
          if (Array.isArray(data)) {
            setCourses(data);
          } else {
            setError(data?.error || "Unable to load courses.");
          }

          setLoading(false);
        },
      );
    }

    return () => abortController.abort();
  }, [authData, identity, capture]);

  return (<main className={styles.page}><h1>My courses</h1><Link to="/teach/course/new">Create course</Link>{statsError && <p role="alert">{statsError}</p>}{loading || loadedIdentity !== identity ? <CourseSkeletons /> : error ? <PageState error message={error} /> : courses.length === 0 ? <PageState message="No courses yet." /> : courses.map(course => <CourseCardWithStats key={course._id} course={course} stats={statsByCourse[String(course._id)]} statsLoading={statsLoading} />)}</main>);
}
