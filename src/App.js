import React, { useState } from "react";
import Login from "./components/Login";
import ClientDashboard from "./components/ClientDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { getUser, clearSession } from "./utils/api";
import "./App.css";

function App() {
  // Start from the saved session, so a refresh doesn't log anyone out
  const [user, setUser] = useState(() => getUser());

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Admin is now a flag on the account, not a hardcoded email.
  // The backend checks the same flag, so this is only about which screen shows.
  if (user.is_admin === true) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return <ClientDashboard user={user} onLogout={handleLogout} />;
}

export default App;