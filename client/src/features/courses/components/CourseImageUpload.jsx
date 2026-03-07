import CourseImage from "../../../shared/components/CourseImage";
import styles from "./CourseImageUpload.module.css";

export default function CourseImageUpload({
  inputId,
  inputRef,
  src,
  alt,
  fileName,
  onChange,
  disabled = false,
}) {
  return (
    <div className={styles.upload}>
      <CourseImage
        src={src}
        alt={alt || "Course cover preview"}
        loading="eager"
        className={styles.preview}
      />
      <div className={styles.details}>
        <p className={styles.description}>
          {fileName || "Choose a clear, landscape image for your course."}
        </p>
        <p id={`${inputId}-hint`} className={styles.hint}>
          PNG, JPG or WebP · Under 5 MB
        </p>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onChange}
          disabled={disabled}
          aria-label="Course image"
          aria-describedby={`${inputId}-hint`}
          hidden
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={styles.button}
          disabled={disabled}
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
            <path d="M12 16V4m-4 4 4-4 4 4M4 16v4h16v-4" />
          </svg>
          {src ? "Change image" : "Upload image"}
        </button>
      </div>
    </div>
  );
}
