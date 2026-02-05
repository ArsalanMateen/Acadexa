import { useSyncExternalStore } from "react";

let cachedRaw;
let cachedAuth = false;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

function store(value) {
  cachedRaw = value ? JSON.stringify(value) : null;
  cachedAuth = value || false;

  for (const key of ["sessionStorage", "localStorage"]) {
    try {
      if (value) {
        window[key].setItem("jwt", cachedRaw);
      } else window[key].removeItem("jwt");
    } catch {
      /* Keep the current session usable when storage is unavailable. */
    }
  }

  notify();
}

const auth = {
  authenticate(jwt, cb) {
    store(jwt);
    cb?.();
  },

  isAuthenticated() {
    if (typeof window === "undefined") return false;

    let raw;

    try {
      raw = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
    } catch {
      return cachedAuth;
    }

    if (raw === cachedRaw) return cachedAuth;

    cachedRaw = raw;

    try {
      const data = JSON.parse(raw);

      cachedAuth = data?.token && data?.user?._id ? data : false;
    } catch {
      cachedAuth = false;
    }

    return cachedAuth;
  },

  clearJWT(cb) {
    store(null);
    cb?.();
  },

  updateUser(user, cb) {
    const current = auth.isAuthenticated();

    if (current) {
      store({ ...current, user: { ...current.user, ...user } });
      cb?.();
    }
  },
};

function subscribe(listener) {
  listeners.add(listener);

  const onStorage = (event) => {
    if (event.key === "jwt" || event.key === null) {
      try {
        sessionStorage.removeItem("jwt");
      } catch {
        /* Storage may be disabled. */
      }

      cachedRaw = undefined;
      notify();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const useAuth = () =>
  useSyncExternalStore(subscribe, auth.isAuthenticated, () => false);

export default auth;
