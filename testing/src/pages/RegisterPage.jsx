import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Create the user data object, including the hardcoded role
      const registerData = {
        name,
        email,
        password,
        phoneNumber,
        role: "MANAGER", // Automatically assign the MANAGER role
      };
      
      await ApiService.registerUser(registerData);
      
      showMessage("Registration successful! Redirecting to login...");

      // Navigate to the login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error registering user."
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
      <h2>Register as a Manager</h2>

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />

        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default RegisterPage;