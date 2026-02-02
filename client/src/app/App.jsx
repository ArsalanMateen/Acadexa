import { BrowserRouter, Routes, Route } from "react-router-dom";


export default function App() {
  return (<BrowserRouter><div className="app-container"><main className="main-content"><Routes><Route path="*" element={<p>Acadexa</p>} /></Routes></main></div></BrowserRouter>);
}
