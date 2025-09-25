import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from "react";
// Service and Guard Imports
import { ProtectedRoute, AdminRoute, ManagerRoute } from "./service/Guard";

// Page Imports
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CategoryPage from "./pages/CategoryPage";
import SupplierPage from "./pages/SupplierPage";
import AddEditSupplierPage from "./pages/AddEditSupplierPage";
import ProductPage from "./pages/ProductPage";
import AddEditProductPage from "./pages/AddEditProductPage";
import PurchasePage from "./pages/PurchasePage";
import SellPage from "./pages/SellPage";
import TransactionsPage from "./pages/TransactionsPage";
import TransactionDetailsPage from "./pages/TransactionDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import ApiService from "./service/ApiService";
function App() {
   useEffect(() => {
    // This runs once when the app first loads
    const verifyUser = async () => {
      if (ApiService.isAuthenticated()) {
        try {
          // Try to fetch the logged-in user's info
          await ApiService.getLoggedInUserInfo();
          // If this succeeds, the token is valid. Do nothing.
        } catch (error) {
          // If it fails, the token is invalid (server was reset).
          // Log the user out automatically.
          ApiService.clearAuth();
        }
      }
    };
    verifyUser();
  }, []); 
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
      />
      
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ADMIN ONLY ROUTES */}
        <Route path="/category" element={<AdminRoute element={<CategoryPage />} />} />
        <Route path="/supplier" element={<AdminRoute element={<SupplierPage />} />} />
        <Route path="/add-supplier" element={<AdminRoute element={<AddEditSupplierPage />} />} />
        <Route path="/edit-supplier/:supplierId" element={<AdminRoute element={<AddEditSupplierPage />} />} />
        
        {/* MANAGER & ADMIN ROUTES */}
        <Route path="/product" element={<ManagerRoute element={<ProductPage />} />} />
        <Route path="/add-product" element={<ManagerRoute element={<AddEditProductPage />} />} />
        <Route path="/edit-product/:productId" element={<ManagerRoute element={<AddEditProductPage />} />} />
        <Route path="/purchase" element={<ManagerRoute element={<PurchasePage />} />} />
        <Route path="/sell" element={<ManagerRoute element={<SellPage />} />} />
        <Route path="/transaction" element={<ManagerRoute element={<TransactionsPage />} />} />
        <Route path="/transaction/:transactionId" element={<ManagerRoute element={<TransactionDetailsPage />} />} />
        <Route path="/dashboard" element={<ManagerRoute element={<DashboardPage />} />} />
        
        {/* PROTECTED ROUTES (For any logged-in user) */}
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
        
        {/* CATCH-ALL ROUTE (redirects to login) */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;