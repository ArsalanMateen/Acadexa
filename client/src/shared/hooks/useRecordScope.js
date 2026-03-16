import { useLayoutEffect, useState } from "react";
import { createRequestScope } from "./requestScope.js";

export default function useRecordScope(identity) {
  const [scope] = useState(createRequestScope);

  useLayoutEffect(() => {
    scope.reset();
    return scope.cancel;
  }, [scope, identity]);

  return scope.capture;
}
