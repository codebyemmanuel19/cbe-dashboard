import React, { useState } from "react";
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (email === "" || password === "") {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://cbe-quicksite-backend.onrender.com/clients/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Real client record from the database
      onLoginSuccess(data.client);
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>CBE QuickSite</h1>
        <p className="login-subtitle">Log in to manage your website</p>

        {error && <p className="login-error">{error}</p>}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}

export default Login;