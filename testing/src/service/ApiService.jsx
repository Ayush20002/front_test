import axios from "axios";
import CryptoJS from "crypto-js";

export default class ApiService {
  static BASE_URL = "http://localhost:5050/api";
  static ENCRYPTION_KEY = "phegon-dev-inventory";

  // --- Local Storage Encryption ---
  static encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.ENCRYPTION_KEY).toString();
  }

  static decrypt(data) {
    const bytes = CryptoJS.AES.decrypt(data, this.ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
  static saveUserId(userId) {
  localStorage.setItem("userId", this.encrypt(userId));
}

static getUserId() {
  const encryptedUserId = localStorage.getItem("userId");
  if (!encryptedUserId) return null;
  return this.decrypt(encryptedUserId);
}

  static saveToken(token) {
    localStorage.setItem("token", this.encrypt(token));
  }

  static getToken() {
    const encryptedToken = localStorage.getItem("token");
    if (!encryptedToken) return null;
    return this.decrypt(encryptedToken);
  }

  static saveRole(role) {
    localStorage.setItem("role", this.encrypt(role));
  }

  static getRole() {
    const encryptedRole = localStorage.getItem("role");
    if (!encryptedRole) return null;
    return this.decrypt(encryptedRole);
  }

  static clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId"); // Add this line
}

  static getHeader() {
    const token = this.getToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // --- AUTH && USERS API ---
  static async registerUser(registerData) {
    const response = await axios.post(`${this.BASE_URL}/users`, registerData);
    return response.data;
  }
  
  /* This method is not used with the mock server, as login logic is simulated in LoginPage.
  static async loginUser(loginData) {
    const response = await axios.post(`${this.BASE_URL}/auth/login`, loginData);
    return response.data;
  }
  */

  static async getAllUsers() {
    const response = await axios.get(`${this.BASE_URL}/users`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  
static async getLoggedInUsesInfo() {
  const userId = this.getUserId(); // Get the ID from localStorage
  if (!userId) return null; // If no user is logged in, return null

  // Fetch the specific user by their ID
  const response = await axios.get(`${this.BASE_URL}/users/${userId}`, {
    headers: this.getHeader(),
  });
  return response.data;
}
  
  static async getUserById(userId) {
    const response = await axios.get(`${this.BASE_URL}/users/${userId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateUser(userId, userData) {
    const response = await axios.put(`${this.BASE_URL}/users/${userId}`, userData, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async deleteUser(userId) {
    const response = await axios.delete(`${this.BASE_URL}/users/${userId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  // --- PRODUCT ENDPOINTS ---
  static async addProduct(productData) {
  // The header will default to 'application/json', which is what we want
  const response = await axios.post(`${this.BASE_URL}/products`, productData, {
    headers: this.getHeader(),
  });
  return response.data;
}
// Add this new method to your ApiService class
  static async setCurrentUser(userData) {
    // This will replace the entire current_user object in db.json
    const response = await axios.put(`${this.BASE_URL}/current_user`, userData, {
      headers: this.getHeader(),
    });
    return response.data;
  }

static async updateProduct(productId, productData) {
  const response = await axios.put(`${this.BASE_URL}/products/${productId}`, productData, {
    headers: this.getHeader(),
  });
  return response.data;
}

  static async getAllProducts() {
    const response = await axios.get(`${this.BASE_URL}/products`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getProductById(productId) {
    const response = await axios.get(`${this.BASE_URL}/products/${productId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async searchProduct(searchValue) {
    const response = await axios.get(`${this.BASE_URL}/products`, {
      params: { q: searchValue },
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async deleteProduct(productId) {
    const response = await axios.delete(`${this.BASE_URL}/products/${productId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  // --- CATEGORY ENDPOINTS ---
  static async createCategory(category) {
    const response = await axios.post(`${this.BASE_URL}/categories`, category, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getAllCategory() {
    const response = await axios.get(`${this.BASE_URL}/categories`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateCategory(categoryId, categoryData) {
    const response = await axios.put(`${this.BASE_URL}/categories/${categoryId}`, categoryData, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async deleteCategory(categoryId) {
    const response = await axios.delete(`${this.BASE_URL}/categories/${categoryId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  // --- SUPPLIER ENDPOINTS ---
  static async addSupplier(supplierData) {
    const response = await axios.post(`${this.BASE_URL}/suppliers`, supplierData, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getAllSuppliers() {
    const response = await axios.get(`${this.BASE_URL}/suppliers`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateSupplier(supplierId, supplierData) {
    const response = await axios.put(`${this.BASE_URL}/suppliers/${supplierId}`, supplierData, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async deleteSupplier(supplierId) {
    const response = await axios.delete(`${this.BASE_URL}/suppliers/${supplierId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  // --- TRANSACTIONS ENDPOINTS ---
  static async purchaseProduct(body) {
    const response = await axios.post(`${this.BASE_URL}/transactions/purchase`, body, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async sellProduct(body) {
    const response = await axios.post(`${this.BASE_URL}/transactions/sell`, body, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async returnToSupplier(body) {
    const response = await axios.post(`${this.BASE_URL}/transactions/return`, body, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getAllTransactions(filter) {
    const response = await axios.get(`${this.BASE_URL}/transactions`, {
      headers: this.getHeader(),
      params: { q: filter },
    });
    return response.data;
  }

  static async getTransactionById(transactionId) {
    const response = await axios.get(`${this.BASE_URL}/transactions/${transactionId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }
  
  static async updateTransactionStatus(transactionId, status) {
    const response = await axios.patch(`${this.BASE_URL}/transactions/${transactionId}`, { status }, {
      headers: this.getHeader()
    })
    return response.data;
  }

  // --- AUTHENTICATION CHECKER ---
  static logout() {
    this.clearAuth();
  }

  static isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  static isAdmin() {
    const role = this.getRole();
    return role === "ADMIN";
  }

  static isManager() {
    const role = this.getRole();
    return role === "MANAGER";
  }
}