import useCourseCatalog from "../useCourseCatalog";
import CourseCard from "../components/CourseCard";
import { PageState } from "../../../shared/components/ui";
export default function Courses() {
  const page = useCourseCatalog();
  return <main><h1>Published courses</h1>{page.loading ? <p role="status">Loading courses</p> : page.error ? <PageState error message={page.error} /> : page.courses.length === 0 ? <PageState message="Published courses will appear here." /> : page.courses.map(course => <CourseCard key={course._id} course={course} />)}</main>;
}
