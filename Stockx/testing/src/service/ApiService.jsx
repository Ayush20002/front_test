import axios from 'axios';

export default class ApiService {
  // 1. A single, configured Axios instance
  static api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
  });

  // 2. The init() method to set up interceptors
  static init() {
    // Request Interceptor: Attaches the JWT to every request
    this.api.interceptors.request.use((config) => {
      // FIXED: Using 'token' key for consistency with components
      const token = localStorage.getItem('token'); 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response Interceptor: Automatically extracts data or handles auth errors
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // --- Authentication Checkers ---
  static clearAuth() {
    // FIXED: Using 'token' key
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  
  static isAuthenticated() {
    // FIXED: Using 'token' key
    return !!localStorage.getItem('token');
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
  
  // Authentication
  static async loginUser(loginData) {
    return this.api.post('/auth/login', loginData);
  }
  
  // ADDED: Method for public registration
  static async registerUser(registerData) {
    return this.api.post('/auth/register', registerData);
  }

  static async getLoggedInUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) return null;
    return this.api.get(`/users/${user.id}`);
  }

  // Users
  static async getAllUsers() {
    return this.api.get('/users');
  }

  static async getUserById(userId) {
    return this.api.get(`/users/${userId}`);
  }

  static async createUser(userData) {
    return this.api.post('/users', userData);
  }

  static async updateUser(userId, userData) {
    return this.api.patch(`/users/${userId}`, userData);
  }

  static async deleteUser(userId) {
    return this.api.delete(`/users/${userId}`);
  }

  // Products
  static async getAllProducts() {
    return this.api.get('/products');
  }
  
  static async getProductById(productId) {
    return this.api.get(`/products/${productId}`);
  }

  static async searchProductsByModel(model) {
    return this.api.get('/products/search', { params: { model } });
  }
  
  static async createProduct(productData) {
    return this.api.post('/products', productData);
  }
  
  static async updateProduct(productId, productData) {
    return this.api.patch(`/products/${productId}`, productData);
  }

  static async deleteProduct(productId) {
    return this.api.delete(`/products/${productId}`);
  }

  // Categories
  static async getAllCategories() {
    return this.api.get('/categories');
  }
  
  static async getCategoryById(categoryId) {
    return this.api.get(`/categories/${categoryId}`);
  }

  static async createCategory(categoryData) {
    return this.api.post('/categories', categoryData);
  }

  static async updateCategory(categoryId, categoryData) {
    return this.api.patch(`/categories/${categoryId}`, categoryData);
  }

  static async deleteCategory(categoryId) {
    return this.api.delete(`/categories/${categoryId}`);
  }

  // Suppliers
  static async getAllSuppliers() {
    return this.api.get('/suppliers');
  }
  
  static async getSupplierById(supplierId) {
    return this.api.get(`/suppliers/${supplierId}`);
  }

  static async createSupplier(supplierData) {
    return this.api.post('/suppliers', supplierData);
  }

  static async updateSupplier(supplierId, supplierData) {
    return this.api.patch(`/suppliers/${supplierId}`, supplierData);
  }

  static async deleteSupplier(supplierId) {
    return this.api.delete(`/suppliers/${supplierId}`);
  }

  // Transactions
  static async getAllTransactions() {
    return this.api.get('/transactions');
  }

  static async getTransactionById(transactionId) {
    return this.api.get(`/transactions/${transactionId}`);
  }
  
  static async sellProduct(transactionData) {
    return this.api.post('/transactions/sell', transactionData);
  }
  
  static async purchaseProduct(transactionData) {
    return this.api.post('/transactions/purchase', transactionData);
  }

  static async updateTransaction(transactionId, transactionData) {
    return this.api.patch(`/transactions/${transactionId}`, transactionData);
  }
}

// Self-initialize the service
ApiService.init();