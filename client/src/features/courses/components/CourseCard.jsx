import CourseImage from "../../../shared/components/CourseImage";
import { Link } from "react-router-dom";
export default function CourseCard({ course }) {
  if (!course) return null;
  return <Link to={`/course/${course._id}`}><CourseImage src={course.image} alt={course.name} loading="lazy" /><h3>{course.name}</h3><p>{course.category}</p><p>By {course.instructor?.name || "Instructor"}</p><p>{course.description}</p></Link>;
}
