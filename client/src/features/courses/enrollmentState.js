export function validStats(stats) {
  return (
    Number.isSafeInteger(stats?.totalEnrolled) &&
    stats.totalEnrolled >= 0 &&
    Number.isSafeInteger(stats?.totalCompleted) &&
    stats.totalCompleted >= 0 &&
    stats.totalCompleted <= stats.totalEnrolled
  );
}

export function enrollmentLookup(data) {
  if (data?.error)
    return { status: "error", enrollmentId: null, error: data.error };
  if (data?.enrollmentId === null) {
    return { status: "notEnrolled", enrollmentId: null, error: "" };
  }
  if (
    typeof data?.enrollmentId === "string" &&
    /^[a-f\d]{24}$/i.test(data.enrollmentId)
  ) {
    return { status: "enrolled", enrollmentId: data.enrollmentId, error: "" };
  }

  return {
    status: "error",
    enrollmentId: null,
    error: "Unable to check enrollment. Please try again.",
  };
}
