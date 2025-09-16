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
    const allUsers = await ApiService.getAllUsers();
    const foundUser = allUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      // CORRECTED: Save the user's ID, token, and role locally
      ApiService.saveUserId(foundUser.id); 
      ApiService.saveToken("mock-jwt-token-" + foundUser.email);
      ApiService.saveRole(foundUser.role);

      showMessage("Login successful!");
      navigate("/dashboard");
    } else {
      showMessage("Invalid email or password.");
    }
  } catch (error) {
    showMessage("An error occurred during login. Is the mock server running?");
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