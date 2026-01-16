const getErrorMessage = (err) => {
  if (err?.errors) return Object.values(err.errors)[0]?.message || "Invalid account data.";
  return err?.message || "An unexpected error occurred. Please try again.";
};

export default { getErrorMessage };
