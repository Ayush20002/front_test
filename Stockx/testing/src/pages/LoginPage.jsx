import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import ApiService from "../service/ApiService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // ADDED: This useEffect handles displaying messages passed from other pages (like Register)
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loginData = { email, password };
      const response = await ApiService.loginUser(loginData);

      const { jwt, ...user } = response;

      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(user));
      
      ApiService.api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      
      // CHANGED: Navigate to the dashboard WITH a success message
      navigate("/dashboard", { state: { message: "Login Successful!" } });
      
    } catch (error) {
      // CHANGED: Use toast for a consistent error message style
      toast.error(
        error.response?.data?.message || "Invalid email or password."
      );
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {/* The old <p> tag for messages is no longer needed */}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/register">Register as a Manager</a>
      </p>
    </div>
  );
};

export default LoginPage;