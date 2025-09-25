import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import ApiService from "../service/ApiService";

const Sidebar = () => {
  const navigate = useNavigate();
  const isAuth = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
  const isManager = ApiService.isManager(); // 1. ADDED: Get the manager status

  const logout = () => {
    ApiService.clearAuth(); // Use clearAuth from ApiService
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <h1 className="ims">StockSync</h1>
      <ul className="nav-links">
        {isAuth && (
          <li>
            {/* Corrected spelling of Dashboard */}
            <Link to="/dashboard">Dashboard</Link>
          </li>
        )}

        {isAuth && (
          <li>
            <Link to="/transaction">Transactions</Link>
          </li>
        )}

        {/* These links will only be shown to Admins */}
        {isAdmin && (
          <li>
            <Link to="/category">Category</Link>
          </li>
        )}
        
        {isAdmin && (
          <li>
            <Link to="/supplier">Supplier</Link>
          </li>
        )}

        {/* 2. CHANGED: This link will now be shown to Managers AND Admins */}
        {isManager && (
          <li>
            <Link to="/product">Product</Link>
          </li>
        )}

        {isAuth && (
          <li>
            <Link to="/purchase">Purchase</Link>
          </li>
        )}

        {isAuth && (
          <li>
            <Link to="/sell">Sell</Link>
          </li>
        )}

        {isAuth && (
          <li>
            <Link to="/profile">Profile</Link>
          </li>
        )}

        {isAuth && (
          <li>
            {/* Changed to a button for better practice, but Link is fine too */}
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;