import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import ApiService from "./ApiService";

/**
 * For development with the mock server, these components are set to "pass-through",
 * meaning they will always render the component.
 * The real security logic is commented out for easy re-activation later.
 */

export const ProtectedRoute = ({ element: Component }) => {
  // const location = useLocation();
  // return ApiService.isAuthenticated() ? (
  //   Component
  // ) : (
  //   <Navigate to="/login" replace state={{ from: location }} />
  // );
  return Component;
};

export const AdminRoute = ({ element: Component }) => {
  // const location = useLocation();
  // return ApiService.isAdmin() ? (
  //   Component
  // ) : (
  //   <Navigate to="/unauthorized" replace state={{ from: location }} /> // Or a 403 page
  // );
  return Component;
};

export const ManagerRoute = ({ element: Component }) => {
  // const location = useLocation();
  // // Admins should typically have access to Manager routes as well
  // return ApiService.isManager() || ApiService.isAdmin() ? (
  //   Component
  // ) : (
  //   <Navigate to="/unauthorized" replace state={{ from: location }} /> // Or a 403 page
  // );
  return Component;
};