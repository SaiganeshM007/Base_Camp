import React from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h2>Welcome</h2>
      <div className="button-container">
        <button onClick={() => navigate("/login")}>Existing User?</button>
        <button onClick={() => navigate("/signup")}>New User?</button>
      </div>
    </div>
  );
};

export default HomePage;
