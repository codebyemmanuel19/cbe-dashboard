import React, { useState } from "react";
import Login from "./components/Login";
import ClientDashboard from "./components/ClientDashboard";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

const ADMIN_EMAIL = "admin@cbequicksite.com"; // your own login email

function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (user.email === ADMIN_EMAIL) {
    return <AdminDashboard />;
  }

  return <ClientDashboard user={user} />;
}

export default App;