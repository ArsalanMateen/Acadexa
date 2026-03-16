// Tokens invalidate reads, file previews and writes after a record/account changes or unmounts.
export function createRequestScope() {
  let generation = 0;
  let active = false;

  return {
    reset: () => {
      generation++;
      active = true;
    },
    cancel: () => {
      generation++;
      active = false;
    },
    capture: () => {
      const token = generation;

      return () => active && token === generation;
    },
  };
}
