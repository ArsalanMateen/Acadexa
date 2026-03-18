import CourseImageUpload from "../components/CourseImageUpload";
import useRecordScope from "../../../shared/hooks/useRecordScope";
import { safeHttpUrl } from "../../../shared/utils/resources";
import { categories } from "../categories";
import { PageSkeleton, PageState } from "../../../shared/components/ui";
import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { read, update, remove } from "../course";
import styles from "./EditCourse.module.css";

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const imageInput = useRef(null);
  const previewReader = useRef(null);
  const authData = useAuth();
  const identity = `${courseId}:${authData?.token}`;
  const [loadedIdentity, setLoadedIdentity] = useState(null);

  const [course, setCourse] = useState({
    name: "",
    description: "",
    category: "Web Development",
    published: false,
    lessons: [],
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const capture = useRecordScope(identity);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("overview");
  const [editingLessonIdx, setEditingLessonIdx] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    resource_url: "",
  });

  useEffect(() => {
    const abortController = new AbortController();
    const isCurrent = capture();

    // oxlint-disable-next-line react/set-state-in-effect -- Reset stale content when starting a new asynchronous request.
    setLoading(true);
    setLoadError("");
    setLoadedIdentity(identity);
    previewReader.current?.abort();

    setImage(null);
    setImagePreview(null);
    setSaving(false);
    setError("");
    setMode("overview");
    setEditingLessonIdx(null);
    setLessonForm({ title: "", content: "", resource_url: "" });

    read({ courseId }, abortController.signal, { t: authData?.token }).then((data) => {
      if (abortController.signal.aborted) return;
      if (!isCurrent()) return;
      if (data && !data.error) {
        if (data.instructor?._id !== authData.user._id) {
          setLoadError("You can only edit your own courses.");
          setLoading(false);

          return;
        }

        setCourse({
          name: data.name || "",
          description: data.description || "",
          category: data.category || "Web Development",
          published: Boolean(data.published),
          lessons: data.lessons || [],
          image: data.image || "",
        });
      }
      if (!data || data.error) setLoadError(data?.error || "Unable to load this page.");

      setLoading(false);
    });

    return () => {
      abortController.abort();
      previewReader.current?.abort();
    };
  }, [courseId, authData, identity, capture]);

  const handleFieldChange = (name) => (e) => {
    setCourse({ ...course, [name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setImage(file);

      const isCurrent = capture();
      previewReader.current?.abort();

      const reader = new FileReader();
      previewReader.current = reader;
      reader.onload = (ev) => {
        if (isCurrent() && previewReader.current === reader) {
          setImagePreview(ev.target.result);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleTogglePublished = () => {
    setCourse((prev) => ({ ...prev, published: !prev.published }));
  };

  const handleSaveCourse = async (e) => {
    if (e) e.preventDefault();
    if (saving) return;
    if (!course.name.trim() || !course.category.trim()) {
      setError("Course title and category are required.");
      return;
    }

    setSaving(true);
    setError("");

    const courseData = new FormData();
    courseData.append("name", course.name);
    courseData.append("description", course.description);
    courseData.append("category", course.category);
    courseData.append("published", course.published);
    courseData.append("lessons", JSON.stringify(course.lessons));

    if (image) {
      courseData.append("image", image);
    }

    const isCurrent = capture();

    const data = await update({ courseId }, { t: authData.token }, courseData);

    if (!isCurrent()) return;
    if (data && data.error) {
      setError(data.error);
    } else if (data) {
      navigate("/teach/courses");
    }

    setSaving(false);
  };

  const handleDeleteCourse = async () => {
    if (
      window.confirm("Are you sure you want to delete this entire course? This cannot be undone.")
    ) {
      if (saving) return;

      setSaving(true);

      const isCurrent = capture();

      const data = await remove({ courseId }, { t: authData.token });

      if (!isCurrent()) return;
      if (data && !data.error) {
        navigate("/teach/courses");
      } else setError(data?.error || "Unable to delete course.");

      setSaving(false);
    }
  };

  const handleOpenAddLesson = () => {
    setLessonForm({ title: "", content: "", resource_url: "" });
    setEditingLessonIdx(null);
    setMode("add-lesson");
  };

  const handleOpenEditLesson = (idx) => {
    const target = course.lessons[idx];

    setLessonForm({
      title: target.title || "",
      content: target.content || "",
      resource_url: target.resource_url || "",
    });
    setEditingLessonIdx(idx);
    setMode("edit-lesson");
  };

  const handleDeleteLesson = async (idx) => {
    if (window.confirm("Remove this lesson from curriculum?")) {
      const updatedLessons = [...course.lessons];
      updatedLessons.splice(idx, 1);

      const courseData = new FormData();
      courseData.append("lessons", JSON.stringify(updatedLessons));

      if (saving) return;

      setSaving(true);
      setError("");

      const isCurrent = capture();

      const data = await update({ courseId }, { t: authData.token }, courseData);

      if (!isCurrent()) return;
      if (data?.error) {
        setError(data.error);
      } else setCourse((prev) => ({ ...prev, lessons: data.lessons }));

      setSaving(false);
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();

    if (saving) return;
    if (!lessonForm.title.trim()) {
      setError("Lesson title is required.");
      return;
    }
    if (lessonForm.resource_url && !safeHttpUrl(lessonForm.resource_url)) {
      setError("Resource URL must start with http:// or https://");
      return;
    }

    setSaving(true);
    setError("");

    let updatedLessons = [...course.lessons];

    if (editingLessonIdx !== null) {
      updatedLessons[editingLessonIdx] = {
        ...updatedLessons[editingLessonIdx],
        title: lessonForm.title,
        content: lessonForm.content,
        resource_url: lessonForm.resource_url,
      };
    } else {
      updatedLessons.push({
        title: lessonForm.title,
        content: lessonForm.content,
        resource_url: lessonForm.resource_url,
      });
    }

    const courseData = new FormData();
    courseData.append("lessons", JSON.stringify(updatedLessons));

    const isCurrent = capture();

    const data = await update({ courseId }, { t: authData.token }, courseData);

    if (!isCurrent()) return;
    if (data?.error) {
      setError(data.error);
    } else {
      setCourse((prev) => ({ ...prev, lessons: data.lessons }));
      setMode("overview");
    }

    setSaving(false);
  };

  if (loading || loadedIdentity !== identity) {
    return <PageSkeleton variant="form" label="Loading course editor" />;
  }
  if (loadError) return <PageState error message={loadError} />;

  const lessons = course.lessons || [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <main className={styles.main}>
          {error && mode !== "overview" && <p role="alert">{error}</p>}
          {mode === "overview" && (
            <div>
              <Link to="/teach/courses" className={styles.back}>
                <svg
                  className={styles.backIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Back to my courses</span>
              </Link>

              <header className={styles.header}>
                <h1 className={styles.title}>Edit Course</h1>
                <p className={styles.subtitle}>
                  Update your course details, manage lessons, and keep your content up to date.
                </p>
              </header>

              {error && (
                <div role="alert" className={styles.error}>
                  {error}
                </div>
              )}

              <div className={styles.grid}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Course Information</h2>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Course image</label>
                    <CourseImageUpload
                      key={courseId}
                      inputId="edit-course-image"
                      inputRef={imageInput}
                      src={imagePreview || course.image}
                      alt={course.name || "Course cover preview"}
                      fileName={image?.name}
                      onChange={handleImageChange}
                      disabled={saving}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="editcourse-field-1" className={styles.label}>
                      Course title
                    </label>
                    <input
                      id="editcourse-field-1"
                      type="text"
                      className={styles.input}
                      value={course.name}
                      onChange={handleFieldChange("name")}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="course-category" className={styles.label}>
                      Category
                    </label>
                    <div className={styles.selectWrap}>
                      <select
                        id="course-category"
                        className={styles.select}
                        value={course.category}
                        onChange={handleFieldChange("category")}
                        required
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                        {!categories.includes(course.category) && (
                          <option value={course.category}>{course.category}</option>
                        )}
                      </select>
                      <svg
                        className={styles.selectChevron}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="editcourse-field-2" className={styles.label}>
                      Description
                    </label>
                    <textarea
                      id="editcourse-field-2"
                      className={styles.textarea}
                      rows="4"
                      value={course.description}
                      onChange={handleFieldChange("description")}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Publish status</label>
                    <div className={styles.toggleGroup}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          aria-label="Publish course"
                          checked={course.published}
                          onChange={handleTogglePublished}
                        />
                        <span className={styles.switchSlider} />
                      </label>
                      <span className={styles.toggleLabel}>This course is visible to learners</span>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.lessonsHeader}>
                    <h2 className={styles.cardTitle}>Lessons ({lessons.length})</h2>
                    <button
                      type="button"
                      onClick={handleOpenAddLesson}
                      disabled={saving}
                      className={styles.addLessonButton}
                      title="Add lesson"
                      aria-label="Add lesson"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.plusIcon}
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>

                  {lessons.length === 0 && (
                    <p className={styles.lessonsEmpty}>No lessons yet. Add your first lesson.</p>
                  )}
                  {lessons.length > 0 && (
                    <div className={styles.lessons}>
                      {lessons.map((lesson, idx) => (
                        <div key={lesson._id || idx} className={styles.lesson}>
                          <div className={styles.lessonLeft}>
                            <svg
                              className={styles.dragIcon}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="9" cy="5" r="1" />
                              <circle cx="9" cy="12" r="1" />
                              <circle cx="9" cy="19" r="1" />
                              <circle cx="15" cy="5" r="1" />
                              <circle cx="15" cy="12" r="1" />
                              <circle cx="15" cy="19" r="1" />
                            </svg>
                            <span className={styles.lessonNumber}>{idx + 1}</span>
                            <span className={styles.lessonName}>{lesson.title}</span>
                          </div>

                          <div className={styles.lessonActions}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditLesson(idx)}
                              disabled={saving}
                              className={styles.editLessonButton}
                              title="Edit lesson"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(idx)}
                              disabled={saving}
                              className={styles.deleteLessonButton}
                              title="Delete lesson"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.bottomBar}>
                <button
                  type="button"
                  onClick={handleDeleteCourse}
                  disabled={saving}
                  className={styles.dangerButton}
                >
                  Delete course
                </button>

                <div className={styles.actionsGroup}>
                  <Link to="/teach/courses" className={styles.cancelButton}>
                    Cancel
                  </Link>
                  <button
                    type="button"
                    onClick={handleSaveCourse}
                    className={styles.saveButton}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode !== "overview" && <form onSubmit={handleSaveLesson}>{["title", "content", "resource_url"].map(field => <label key={field}>{field}<input value={lessonForm[field]} onChange={event => setLessonForm({ ...lessonForm, [field]: event.target.value })} /></label>)}<button disabled={saving}>Save lesson</button><button type="button" onClick={() => setMode("overview")}>Cancel</button></form>}
        </main>
      </div>
    </div>
  );
}
