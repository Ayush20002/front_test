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

      // We access .token and .user directly from the response
      localStorage.setItem('jwt', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      showMessage("Login successful!");
      navigate("/dashboard");
      
    } catch (error) {
      showMessage(
        error.response?.data?.error || "Invalid email or password."
      );
      console.error(error);
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