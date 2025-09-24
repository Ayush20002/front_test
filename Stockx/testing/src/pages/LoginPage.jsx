import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loginData = { email, password };
      const response = await ApiService.loginUser(loginData);

      // --- THIS IS THE CORRECTED LOGIC ---

      // 1. Destructure the 'jwt' and user data from the response
      const { jwt, ...user } = response;

      // 2. Save them to localStorage using the correct 'token' key
      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(user));
      
      // 3. IMPORTANT: Immediately set the default auth header for all future requests
      ApiService.api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      
      // 4. Now, navigate to the dashboard
      navigate("/dashboard");
      
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Invalid email or password."
      );
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {message && <p className="message">{message}</p>}

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