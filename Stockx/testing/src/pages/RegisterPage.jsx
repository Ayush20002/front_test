import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService"; // Assuming you have this service file

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const phoneRegex = /^\d{10,15}$/;
    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      showMessage("Please enter a valid phone number (10-15 digits).");
      return;
    }

    try {
      const registerData = {
        name,
        email,
        password,
        phoneNumber,
      };
      
      const response = await ApiService.registerUser(registerData);
      
      // CORRECTED: The 'response' variable is the data object directly.
      const { jwt, ...user } = response;

      // Save the token and user info to localStorage
      localStorage.setItem("token", jwt);
      localStorage.setItem("user", JSON.stringify(user));

      // Navigate directly to the dashboard
      navigate("/dashboard");

    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error registering user."
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