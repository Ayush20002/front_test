import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, AdminRoute, ManagerRoute } from "./service/Guard";
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
import { useEffect } from "react";
function App() {

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ADMIN ONLY ROUTES */}
        <Route path="/category" element={<AdminRoute element={<CategoryPage />} />} />
        <Route path="/supplier" element={<AdminRoute element={<SupplierPage />} />} />
        <Route path="/add-supplier" element={<AdminRoute element={<AddEditSupplierPage />} />} />
        <Route path="/edit-supplier/:supplierId" element={<AdminRoute element={<AddEditSupplierPage />} />} />
        <Route path="/product" element={<AdminRoute element={<ProductPage />} />} />
        <Route path="/add-product" element={<AdminRoute element={<AddEditProductPage />} />} />
        <Route path="/edit-product/:productId" element={<AdminRoute element={<AddEditProductPage />} />} />

        {/* MANAGER & ADMIN ROUTES */}
        <Route path="/purchase" element={<ManagerRoute element={<PurchasePage />} />} />
        <Route path="/sell" element={<ManagerRoute element={<SellPage />} />} />
        <Route path="/transaction" element={<ManagerRoute element={<TransactionsPage />} />} />
        <Route path="/transaction/:transactionId" element={<ManagerRoute element={<TransactionDetailsPage />} />} />
        <Route path="/dashboard" element={<ManagerRoute element={<DashboardPage />} />} />
        
        {/* PROTECTED ROUTES (For any logged-in user) */}
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
        
        {/* CATCH-ALL ROUTE */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;