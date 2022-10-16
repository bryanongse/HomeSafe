import "./App.css";
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  BrowserRouter as Router,
} from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import MainPage from "./Pages/MainPage";

export default function App() {

  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Navigate to="/login" />} />
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/main" element={<MainPage />} />
      </Routes>
    </Router>
  );
}
