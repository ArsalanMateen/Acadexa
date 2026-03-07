import CourseImageUpload from "../components/CourseImageUpload";
import { categories } from "../categories";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/session/auth-helper";
import { create } from "../course";
import styles from "./NewCourse.module.css";

export default function NewCourse() {
  const navigate = useNavigate();
  const imageInput = useRef(null);
  const authData = useAuth();

  const [values, setValues] = useState({
    name: "",
    description: "",
    category: "Web Development",
    published: false,
    image: null,
    imagePreview: null,
    error: "",
    loading: false,
  });

  const handleChange = (name) => (event) => {
    if (name === "image" && !event.target.files[0]) return;

    const value = name === "image" ? event.target.files[0] : event.target.value;

    if (name === "image" && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        setValues((prev) => ({
          ...prev,
          image: file,
          imagePreview: e.target.result,
          error: "",
        }));
      };

      reader.readAsDataURL(file);
    } else {
      setValues({ ...values, [name]: value, error: "" });
    }
  };

  const handleTogglePublished = () => {
    setValues((prev) => ({ ...prev, published: !prev.published }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (values.loading || !values.name.trim() || !values.category.trim()) return;

    setValues({ ...values, loading: true, error: "" });

    const courseData = new FormData();
    courseData.append("name", values.name);
    courseData.append("description", values.description);
    courseData.append("category", values.category);
    courseData.append("published", values.published);

    if (values.image) {
      courseData.append("image", values.image);
    }

    const data = await create(
      { userId: authData.user._id },
      { t: authData.token },
      courseData,
    );

    if (data.error) {
      setValues({ ...values, error: data.error, loading: false });
    } else {
      navigate(`/teach/course/edit/${data._id}`);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <main className={styles.main}>
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
            <h1 className={styles.title}>Create a new course</h1>
            <p className={styles.subtitle}>
              Share your knowledge with learners around the world.
            </p>
          </header>

          {values.error && (
            <div role="alert" className={styles.error}>
              {values.error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Course image</label>
                  <CourseImageUpload
                    inputId="course-image-upload"
                    inputRef={imageInput}
                    src={values.imagePreview}
                    fileName={values.image?.name}
                    onChange={handleChange("image")}
                    disabled={values.loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newcourse-field-1" className={styles.label}>
                    Course title
                  </label>
                  <input
                    id="newcourse-field-1"
                    type="text"
                    className={styles.input}
                    placeholder="Enter course title"
                    value={values.name}
                    onChange={handleChange("name")}
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
                      value={values.category}
                      onChange={handleChange("category")}
                      required
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
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
                  <label htmlFor="newcourse-field-2" className={styles.label}>
                    Description
                  </label>
                  <textarea
                    id="newcourse-field-2"
                    className={styles.textarea}
                    placeholder="Write a description for your course..."
                    rows="4"
                    value={values.description}
                    onChange={handleChange("description")}
                    required
                  />
                </div>

                <div className={styles.toggleGroup}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      aria-label="Publish course"
                      checked={values.published}
                      onChange={handleTogglePublished}
                    />
                    <span className={styles.switchSlider} />
                  </label>
                  <span className={styles.toggleLabel}>
                    Make this course visible to learners
                  </span>
                </div>
              </div>

              <div className={styles.lessonsCard}>
                <div className={styles.lessonsHeader}>
                  <h2 className={styles.lessonsTitle}>Lessons</h2>
                  <button
                    type="submit"
                    className={styles.addLessonButton}
                    title="Save course to start adding lessons"
                    aria-label="Add lesson"
                    disabled={values.loading}
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
                <p className={styles.lessonsSubtitle}>
                  Add the learning content for your course.
                </p>
              </div>
            </div>

            <div className={styles.bottomBar}>
              <Link to="/teach/courses" className={styles.cancelButton}>
                Cancel
              </Link>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={
                  values.loading ||
                  !values.name.trim() ||
                  !values.category.trim()
                }
              >
                {values.loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
