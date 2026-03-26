import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./layout/Navbar";
import { PageState, PageSkeleton } from "../shared/components/ui";
import RouteErrorBoundary from "./RouteErrorBoundary";
import PrivateRoute from "./PrivateRoute";
import Courses from "../features/courses/pages/Courses";

function RouteContent({ children }) {
  const { pathname } = useLocation();

  return (
    <RouteErrorBoundary pathname={pathname}>
      <Suspense fallback={<PageSkeleton label="Loading page" />}>
        {children}
      </Suspense>
    </RouteErrorBoundary>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const Signin = lazy(() => import("../features/auth/pages/Signin"));
const Signup = lazy(() => import("../features/auth/pages/Signup"));
const Profile = lazy(() => import("../features/users/pages/Profile"));
const EditProfile = lazy(() => import("../features/users/pages/EditProfile"));

const Course = lazy(() => import("../features/courses/pages/Course"));
const MyCourses = lazy(() => import("../features/courses/pages/MyCourses"));
const NewCourse = lazy(() => import("../features/courses/pages/NewCourse"));
const EditCourse = lazy(() => import("../features/courses/pages/EditCourse"));

const Enrollment = lazy(() => import("../features/learning/pages/Enrollment"));
const MyLearning = lazy(() => import("../features/learning/pages/MyLearning"));

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <RouteContent>
            <Routes>
              <Route path="/" element={<Courses />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/user/:userId"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/edit/:userId"
                element={
                  <PrivateRoute>
                    <EditProfile />
                  </PrivateRoute>
                }
              />

              <Route path="/course/:courseId" element={<Course />} />

              <Route
                path="/teach/courses"
                element={
                  <PrivateRoute instructorOnly={true}>
                    <MyCourses />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teach/course/new"
                element={
                  <PrivateRoute instructorOnly={true}>
                    <NewCourse />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teach/course/edit/:courseId"
                element={
                  <PrivateRoute instructorOnly={true}>
                    <EditCourse />
                  </PrivateRoute>
                }
              />

              <Route
                path="/learning"
                element={
                  <PrivateRoute>
                    <MyLearning />
                  </PrivateRoute>
                }
              />
              <Route
                path="/learn"
                element={
                  <PrivateRoute>
                    <MyLearning />
                  </PrivateRoute>
                }
              />

              <Route
                path="/learn/:enrollmentId"
                element={
                  <PrivateRoute>
                    <Enrollment />
                  </PrivateRoute>
                }
              />
              <Route
                path="*"
                element={
                  <PageState
                    icon="compass"
                    title="Page not found"
                    message="The page you are looking for doesn't exist or has moved."
                  />
                }
              />
            </Routes>
          </RouteContent>
        </div>
      </div>
    </BrowserRouter>
  );
}
