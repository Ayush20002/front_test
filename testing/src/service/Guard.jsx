import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import ApiService from "./ApiService";

// This Guard checks if a user is logged in at all
export const ProtectedRoute = ({ element: Component }) => {
  const location = useLocation();
  return ApiService.isAuthenticated() ? (
    Component
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

// This Guard checks if the user's role is ADMIN
export const AdminRoute = ({ element: Component }) => {
  const location = useLocation();
  return ApiService.isAdmin() ? (
    Component
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

// This Guard checks if the user's role is MANAGER or ADMIN
export const ManagerRoute = ({ element: Component }) => {
  const location = useLocation();
  // Admins should typically have access to Manager routes as well
  return ApiService.isManager() || ApiService.isAdmin() ? (
    Component
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};