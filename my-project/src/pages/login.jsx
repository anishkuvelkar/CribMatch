import React, { useState } from "react";
import home from "../assets/home.jpg"; // Import the background image
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate for navigation

function Login({ onLogin }) { // Receive onLogin as a prop
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [error, setError] = useState(null); // State for error messages
  const navigate = useNavigate(); // Hook to navigate after login

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    setError(null); // Clear any previous error messages

    try {
      // Send a login request to the server
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST", // Use POST for login
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Send email and password
      });

      const data = await response.json(); // Parse the JSON response

      if (response.ok) {
        // If the response is okay, store the token
        onLogin(true); // Update the authentication state
        localStorage.setItem("token", data.access); // Store the access token in local storage
        // Make sure to access the correct property for the email
        localStorage.setItem("userEmail", data.email || email); // Fallback to the entered email if not returned
        console.log("Access token stored:", data.access); 
        console.log("Email token stored:", data.email || email); // Log the token for debugging
        navigate("/profile"); // Navigate to the profile page
      } else {
        // Show error message if login fails
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      // Handle any errors that occur during the fetch
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${home})` }}
    >
      <div className="w-full max-w-md p-8 bg-white bg-opacity-80 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email} // Controlled input for email
              onChange={(e) => setEmail(e.target.value)} // Update state on input change
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password} // Controlled input for password
              onChange={(e) => setPassword(e.target.value)} // Update state on input change
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Sign In
          </button>
        </form>

        {/* Registration Prompt */}
        <p className="mt-4 text-center text-gray-600">
          Do not have an account yet?{" "}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Click here to register
          </Link>
        </p>

        {error && <p className="text-red-500 text-center">{error}</p>} {/* Display error messages */}
      </div>
    </div>
  );
}

export default Login;
