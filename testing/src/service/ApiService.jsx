import axios from 'axios';
import CryptoJS from 'crypto-js';

export default class ApiService {
  static api = axios.create({
    baseURL: 'http://localhost:5050/api',
  });

  static ENCRYPTION_KEY = "phegon-dev-inventory";

  static init() {
    // Request Interceptor (no changes here)
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('jwt'); 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response Interceptor with DEBUG LOGS
    this.api.interceptors.response.use(
      (response) => {
        // LOG 1: See the full response object from Axios
        console.log("Interceptor received SUCCESSFUL response:", response); 

        // LOG 2: See what we are about to return to the component
        console.log("Interceptor is returning:", response.data); 

        return response.data; 
      },
      (error) => {
        // LOG 3: See any errors that the interceptor catches
        console.error("Interceptor caught an ERROR:", error);
        
        if (error.response?.status === 401) {
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // --- Local Storage and Auth Checkers ---
  static clearAuth() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
  }
  
  static isAuthenticated() {
    return !!localStorage.getItem('jwt');
  }

  static isAdmin() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === "ADMIN";
  }

  static isManager() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === "MANAGER";
  }

  // --- API Methods ---
  static async loginUser(loginData) {
    return this.api.post('/login', loginData);
  }

  static async registerUser(registerData) {
    return this.api.post('/users', registerData);
  }

  static async getAllUsers() {
    return this.api.get('/users');
  }

  static async getLoggedInUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) return null;
    return this.api.get(`/users/${user.id}`);
  }

  static async getAllProducts() {
    return this.api.get('/products');
  }
  
  static async getProductById(productId) {
    return this.api.get(`/products/${productId}`);
  }
  
  static async addProduct(productData) {
    return this.api.post('/products', productData);
  }
  
  static async updateProduct(productId, productData) {
    return this.api.put(`/products/${productId}`, productData);
  }

  static async deleteProduct(productId) {
    return this.api.delete(`/products/${productId}`);
  }

  static async getAllCategory() {
    return this.api.get('/categories');
  }

  static async createCategory(category) {
    return this.api.post('/categories', category);
  }

  static async updateCategory(categoryId, categoryData) {
    return this.api.put(`/categories/${categoryId}`, categoryData);
  }

  static async deleteCategory(categoryId) {
    return this.api.delete(`/categories/${categoryId}`);
  }

  static async getAllSuppliers() {
    return this.api.get('/suppliers');
  }

  static async addSupplier(supplierData) {
    return this.api.post('/suppliers', supplierData);
  }

  static async updateSupplier(supplierId, supplierData) {
    return this.api.put(`/suppliers/${supplierId}`, supplierData);
  }

  static async deleteSupplier(supplierId) {
    return this.api.delete(`/suppliers/${supplierId}`);
  }

  static async getAllTransactions(filter) {
    return this.api.get('/transactions', { params: { q: filter } });
  }
  
  static async getTransactionById(transactionId) {
    return this.api.get(`/transactions/${transactionId}`);
  }

  static async sellProduct(body) {
    return this.api.post('/transactions/sell', body);
  }
  
  static async purchaseProduct(body) {
    return this.api.post('/transactions/purchase', body);
  }

  static async updateTransactionStatus(transactionId, status) {
    return this.api.patch(`/transactions/${transactionId}`, { status });
  }
}
ApiService.init();