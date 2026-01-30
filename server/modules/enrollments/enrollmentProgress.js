// Match progress to embedded lesson IDs; array positions change when lessons are edited.
export function alignLessonStatus(lessons, statuses) {
  const existing = new Map(
    statuses.map((status) => [String(status.lesson), status]),
  );

  return lessons.map(
    (lesson) =>
      existing.get(String(lesson._id)) || {
        lesson: lesson._id,
        complete: false,
      },
  );
}

export function isCourseComplete(statuses) {
  return (
    statuses.length > 0 && statuses.every((status) => status.complete === true)
  );
}
