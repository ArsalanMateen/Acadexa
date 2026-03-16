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

  return (<main className={styles.page}><h1>Edit course</h1>{error && <p role="alert">{error}</p>}<CourseImageUpload inputId="course-image-upload" inputRef={imageInput} src={imagePreview || course.image} onChange={handleImageChange} disabled={saving} />{["name", "description", "category"].map(field => <label key={field}>{field}<input value={course[field]} onChange={handleFieldChange(field)} /></label>)}<label><input type="checkbox" checked={course.published} onChange={handleTogglePublished} />Published</label><button onClick={handleSaveCourse} disabled={saving}>Save</button><button onClick={handleDeleteCourse} disabled={saving}>Delete course</button><ol>{lessons.map((lesson, idx) => <li key={lesson._id}>{lesson.title}<button onClick={() => handleOpenEditLesson(idx)}>Edit</button><button onClick={() => handleDeleteLesson(idx)}>Delete</button></li>)}</ol><button onClick={handleOpenAddLesson}>Add lesson</button>{mode !== "overview" && <form onSubmit={handleSaveLesson}>{["title", "content", "resource_url"].map(field => <label key={field}>{field}<input value={lessonForm[field]} onChange={event => setLessonForm({ ...lessonForm, [field]: event.target.value })} /></label>)}<button disabled={saving}>{mode === "edit-lesson" ? "Update" : "Add lesson"}</button></form>}</main>);
}
