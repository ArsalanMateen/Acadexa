export function publishedCourseCard(course) {
  return {
    _id: course._id,
    name: course.name,
    description: course.description,
    category: course.category,
    image: course.image,
    instructor: course.instructor,
    lessonCount: Array.isArray(course.lessons) ? course.lessons.length : 0,
  };
}
