import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import auth, { useAuth } from "../../shared/session/auth-helper";
import { signout } from "../../features/auth/auth";
import logoImg from "../../assets/acadexa-logo.png";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const authData = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navbarRef = useRef(null);
  const navigationRef = useRef(null);
  const navigationButtonRef = useRef(null);
  const accountButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setNavigationOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (navigationButtonRef.current?.getAttribute("aria-expanded") === "true") {
          navigationButtonRef.current.focus();
        } else if (dropdownRef.current?.contains(document.activeElement)) {
          accountButtonRef.current?.focus();
        }

        setDropdownOpen(false);
        setNavigationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- Close disclosures when navigation or the signed-in account changes.
    setDropdownOpen(false);
    setNavigationOpen(false);
  }, [location.pathname, authData?.user?._id]);

  const handleSignout = () => {
    setDropdownOpen(false);
    setNavigationOpen(false);

    signout().then(() => {
      auth.clearJWT(() => navigate("/"));
    });
  };

  const isCoursesActive =
    location.pathname === "/" ||
    location.pathname === "/courses" ||
    location.pathname.startsWith("/course/");

  const isLearningActive =
    location.pathname === "/learning" || location.pathname.startsWith("/learn");

  const isInstructorUser = Boolean(authData?.user?.instructor);
  const accountName = authData?.user?.name?.trim() || "Account";

  const isInstructorActive = isInstructorUser
    ? location.pathname.startsWith("/teach")
    : authData
      ? location.pathname.startsWith("/user/edit")
      : location.pathname === "/signup" || location.pathname.startsWith("/teach");

  const navigationItems = [
    {
      label: "Courses",
      to: "/courses",
      active: isCoursesActive,
      path: "M12 6v15M3 3l9 3 9-3v15l-9 3-9-3V3Z",
    },
    ...(authData
      ? [
          {
            label: "My Learning",
            to: "/learning",
            active: isLearningActive,
            path: "m3 9 9-5 9 5-9 5-9-5ZM7 12v5l5 3 5-3v-5M21 9v7",
          },
        ]
      : []),
    {
      label: "For Instructors",
      to: isInstructorUser
        ? "/teach/courses"
        : authData
          ? `/user/edit/${authData.user._id}`
          : "/signup",
      active: isInstructorActive,
      path: "M9 6V4h6v2M3 6h18v14H3V6ZM3 11h18M10 11v3h4v-3",
    },
  ];

  return (
    <header className={styles.navbar} ref={navbarRef}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          <img
            src={logoImg}
            alt="Acadexa Logo"
            width="36"
            height="36"
            loading="eager"
            decoding="sync"
            fetchPriority="high"
            className={styles.logo}
          />
          <span className={styles.brandName}>Acadexa</span>
        </Link>

        <nav
          id="navbar-navigation"
          ref={navigationRef}
          className={`${styles.nav} ${navigationOpen ? styles.navOpen : ""}`}
          aria-label="Main Navigation"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setNavigationOpen(false)}
              aria-current={item.active ? "page" : undefined}
              className={`${styles.navItem} ${item.active ? styles.navItemActive : ""}`}
            >
              <svg
                className={styles.navIcon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={item.path} />
              </svg>
              {item.label}
              {item.active && <span className={styles.navIndicator} />}
            </Link>
          ))}
          {!authData && (
            <div className={styles.mobileAuth}>
              <Link
                to="/signup"
                onClick={() => setNavigationOpen(false)}
                className={styles.filledButton}
              >
                Create account
              </Link>
            </div>
          )}
        </nav>

        <div className={styles.auth}>
          {authData ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                type="button"
                ref={accountButtonRef}
                className={styles.profileButton}
                onClick={() => {
                  setNavigationOpen(false);
                  setDropdownOpen((prev) => !prev);
                }}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                aria-controls={dropdownOpen ? "navbar-account-menu" : undefined}
                aria-label={`Account menu for ${accountName}`}
              >
                <span className={styles.userName}>{accountName}</span>
                <svg
                  className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ""}`}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  id="navbar-account-menu"
                  className={styles.dropdown}
                  role="menu"
                  aria-label="Account"
                >
                  <div className={styles.accountSummary} role="presentation">
                    <span className={styles.accountName}>{accountName}</span>
                    <span className={styles.accountRole}>
                      {isInstructorUser ? "Instructor" : "Student"}
                    </span>
                  </div>
                  <div className={styles.dropdownLinks}>
                    <Link
                      to={`/user/${authData.user._id}`}
                      className={styles.dropdownItem}
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>

                    <Link
                      to="/learning"
                      className={styles.dropdownItem}
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Learning
                    </Link>

                    {isInstructorUser ? (
                      <Link
                        to="/teach/courses"
                        className={styles.dropdownItem}
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Instructor Studio
                      </Link>
                    ) : (
                      <Link
                        to={`/user/edit/${authData.user._id}`}
                        className={styles.dropdownItem}
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Become an Instructor
                      </Link>
                    )}
                  </div>

                  <div className={styles.dropdownDivider} />

                  <button
                    type="button"
                    className={styles.dropdownSignout}
                    onClick={handleSignout}
                    role="menuitem"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <path d="m16 17 5-5-5-5M21 12H9" />
                    </svg>
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.guest}>
              <Link to="/signin" className={styles.outlineButton}>
                Sign In
              </Link>
              <Link to="/signup" className={styles.filledButton}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
