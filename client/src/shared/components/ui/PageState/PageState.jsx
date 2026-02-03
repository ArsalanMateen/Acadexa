import styles from "./PageState.module.css";

function TeachIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 3h20" />
      <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
      <path d="m7 21 5-5 5 5" />
      <path d="m9 9 2 2 4-4" />
    </svg>
  );
}

function LearnIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}

function CatalogIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function CurriculumIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4" cy="6" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="4" cy="18" r="1.5" />
    </svg>
  );
}

function NotesIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function CompassIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function SuccessIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ErrorIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

const ICONS = {
  teach: TeachIcon,
  learn: LearnIcon,
  catalog: CatalogIcon,
  curriculum: CurriculumIcon,
  notes: NotesIcon,
  compass: CompassIcon,
  success: SuccessIcon,
  error: ErrorIcon,
};

function renderIcon(icon, error, className) {
  if (icon === false || icon === null) return null;
  if (typeof icon === "string" && ICONS[icon]) {
    const Component = ICONS[icon];
    return <Component className={className} />;
  }
  if (icon) return icon;
  if (error) return <ErrorIcon className={className} />;
  return <CatalogIcon className={className} />;
}

export default function PageState({
  title,
  message,
  description,
  error = false,
  icon,
  compact = false,
  className = "",
}) {
  const resolvedTitle =
    title !== undefined
      ? title
      : error
      ? "Unable to load"
      : undefined;

  const resolvedText = description || message;

  let toneClass = styles.defaultTone;
  if (error || icon === "error") {
    toneClass = styles.errorTone;
  } else if (icon === "success") {
    toneClass = styles.successTone;
  } else if (icon === "teach" || icon === "learn" || icon === "catalog") {
    toneClass = styles.brandTone;
  }

  const renderedIcon = renderIcon(icon, error, styles.icon);

  return (
    <div
      className={`${styles.container} ${styles.state} ${compact ? styles.compact : ""} ${className}`.trim()}
      role={error ? "alert" : undefined}
    >
      {renderedIcon && (
        <div className={`${styles.iconWrap} ${toneClass}`}>
          {renderedIcon}
        </div>
      )}

      {resolvedTitle && (
        <h2 className={`${styles.title} ${error ? styles.errorTitle : ""}`}>
          {resolvedTitle}
        </h2>
      )}

      {resolvedText && <p className={styles.message}>{resolvedText}</p>}
    </div>
  );
}
