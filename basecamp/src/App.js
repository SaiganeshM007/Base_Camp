import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import HomePage from "./HomePage";
import Dashboard from "./components/Dashboard";
import Room from "./components/Room";
import ChoreList from "./components/ChoreList";

import Expenses from "./components/Expenses";
import "./app.css";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rooms/:roomId" element={<Room />} />
            <Route path="/rooms/:roomId/chorelist" element={<ChoreList />} />

            <Route path="/rooms/:roomId/expenses" element={<Expenses />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
