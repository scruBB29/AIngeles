import React from "react";
import "./home.css";
import Headlogo from "../home/headlogo.png";
import { Link } from "react-router-dom";

function home() {
  return (
    <div className="background-container">
      <header className="header">
        {}
        <img src={Headlogo} alt="Your Logo" className="logo" />
      </header>
      <div className="buttons5">
        <button type="button">
          {" "}
          <Link
            style={{ textDecoration: "none", color: "white" }}
            to="/category"
          >
            EXPLORE NOW
          </Link>{" "}
        </button>
      </div>
    </div>
  );
}

export default home;
