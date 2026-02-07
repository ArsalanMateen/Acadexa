import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "../features/auth/pages/Signup.jsx";
import Signin from "../features/auth/pages/Signin.jsx";

export default function App() {
  return (<BrowserRouter><div className="app-container"><main className="main-content"><Routes><Route path="/signup" element={<Signup />} />
<Route path="/signin" element={<Signin />} /><Route path="*" element={<p>Acadexa</p>} /></Routes></main></div></BrowserRouter>);
}
