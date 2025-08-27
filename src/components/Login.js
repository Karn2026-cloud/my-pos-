import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// The backend URL is now pulled from an environment variable.
// On Render, you will set this to your backend service's URL.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

// --- API Abstraction ---
// It's a good practice to keep API calls separate from your components.
const loginUser = async (credentials) => {
  // Use the environment variable to construct the full URL
  const response = await fetch(`${BACKEND_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    // Throw an error with the message from the backend
    throw new Error(data.error || "An unknown error occurred.");
  }

  // The login endpoint only returns a token.
  return data;
};

// --- Component ---
function App({ onAuthChange }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token } = await loginUser(formData);

      // 1. Save only the token from the login response.
      localStorage.setItem("token", token);

      // 2. Notify the parent component that authentication state has changed.
      if (onAuthChange) onAuthChange();

      // 3. Redirect to the main page. The app should then fetch user
      //    profile info using the newly stored token.
      navigate("/");
    } catch (err) {
      // The error message now comes directly from the API service
      setError(err.message || "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="username"
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md px-4 py-2 text-lg font-semibold text-white transition-colors duration-300 ${
              loading
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default App;
