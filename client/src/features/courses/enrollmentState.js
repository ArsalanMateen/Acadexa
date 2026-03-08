export function validStats(stats) {
  return (
    Number.isSafeInteger(stats?.totalEnrolled) &&
    stats.totalEnrolled >= 0 &&
    Number.isSafeInteger(stats?.totalCompleted) &&
    stats.totalCompleted >= 0 &&
    stats.totalCompleted <= stats.totalEnrolled
  );
}
