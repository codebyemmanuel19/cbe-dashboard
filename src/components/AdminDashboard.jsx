import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const API_BASE_URL = "https://cbe-quicksite-backend.onrender.com";

function AdminDashboard() {
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [created, setCreated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const res = await fetch(`${API_BASE_URL}/clients`);
      const data = await res.json();
      if (data.success) {
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setError("");

    if (!businessName || !slug || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          slug,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to create client.");
        setLoading(false);
        return;
      }

      setCreated(true);
      setTimeout(() => setCreated(false), 2000);
      setBusinessName("");
      setSlug("");
      setEmail("");
      setPassword("");

      fetchClients();
    } catch (err) {
      console.error("Error creating client:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>CBE QuickSite Admin</h1>
        <p>Manage all clients</p>
      </header>

      <section className="admin-create">
        <h2>Create New Client</h2>
        <form onSubmit={handleCreateClient}>
          {error && <p className="create-error">{error}</p>}

          <label>Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Joe's Barbershop"
          />

          <label>Slug (subdomain)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="joesbarber"
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="joe@barber.com"
          />

          <label>Password</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set a temporary password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Client"}
          </button>
          {created && <p className="create-success">Client created!</p>}
        </form>
      </section>

      <section className="admin-list">
        <h2>All Clients</h2>
        {loadingClients ? (
          <p>Loading clients...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Slug</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.business_name}</td>
                  <td>{c.slug}</td>
                  <td>{c.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;