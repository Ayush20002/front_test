import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService"; // Assuming you have this service file
import { toast } from 'react-toastify'; // Import toast for error messages

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  // The local message state is no longer needed if using toasts
  // const [message, setMessage] = useState(""); 
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^\d{10,15}$/;
    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      toast.error("Please enter a valid phone number (10-15 digits).");
      return;
    }

    try {
      const registerData = {
        name,
        email,
        password,
        phoneNumber,
      };
      
      // We call the API but don't need to handle the response here
      await ApiService.registerUser(registerData);
      
      // --- THIS IS THE CORRECTED LOGIC ---
      // The old logic for saving the token is removed.
      // Now, we just navigate to the login page with a success message.
      navigate("/login", { 
        state: { message: "Registration successful! Please log in." } 
      });

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error registering user."
      );
    }
  };

  // The local showMessage function is replaced by toast notifications
  
  return (
    <div className="auth-container">
      <h2>Register as a Manager</h2>

      {/* The message <p> tag is no longer needed */}

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