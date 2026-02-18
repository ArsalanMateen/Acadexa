import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "../features/auth/pages/Signup.jsx";
import Signin from "../features/auth/pages/Signin.jsx";
import Profile from "../features/users/pages/Profile.jsx";
import EditProfile from "../features/users/pages/EditProfile.jsx";
import Courses from "../features/courses/pages/Courses.jsx";
import Course from "../features/courses/pages/Course.jsx";
import MyCourses from "../features/courses/pages/MyCourses.jsx";
import Navbar from "./layout/Navbar";
import PrivateRoute from "./PrivateRoute";

export default function App() {
  return (<BrowserRouter><div className="app-container"><Navbar /><main className="main-content"><Routes><Route path="/signup" element={<Signup />} />
<Route path="/signin" element={<Signin />} />
<Route path="/user/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
<Route path="/user/edit/:userId" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
<Route path="/" element={<Courses />} />
<Route path="/courses" element={<Courses />} />
<Route path="/course/:courseId" element={<Course />} />
<Route path="/teach/courses" element={<PrivateRoute instructorOnly><MyCourses /></PrivateRoute>} /><Route path="*" element={<p>Acadexa</p>} /></Routes></main></div></BrowserRouter>);
}
