import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const API_BASE_URL = "https://cbe-quicksite-backend.onrender.com";

const TEMPLATES = [
  { value: "shop", label: "Shop — products, cart, order on WhatsApp" },
  { value: "realestate", label: "Real Estate — properties, specs, enquire" },
];

// Same cleaning the backend does, so the admin sees the real slug before saving
function cleanSlug(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\.cbequicksite\.com$/, "")
    .replace(/[^a-z0-9-]/g, "");
}

function AdminDashboard() {
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [templateType, setTemplateType] = useState("shop");
  const [created, setCreated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [switchingId, setSwitchingId] = useState(null);

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

    const finalSlug = cleanSlug(slug);

    if (!businessName || !finalSlug || !email || !password) {
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
          slug: finalSlug,
          email,
          password,
          template_type: templateType,
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
      setTemplateType("shop");

      fetchClients();
    } catch (err) {
      console.error("Error creating client:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Switch an existing client between templates
  const handleTemplateChange = async (id, value) => {
    setSwitchingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${id}/template`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_type: value }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Failed to change template.");
        return;
      }

      fetchClients();
    } catch (err) {
      console.error("Error changing template:", err);
      alert("Something went wrong changing the template.");
    } finally {
      setSwitchingId(null);
    }
  };

  const previewSlug = cleanSlug(slug);

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
          {previewSlug && (
            <p className="slug-preview">{previewSlug}.cbequicksite.com</p>
          )}

          <label>Website Type</label>
          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
          >
            {TEMPLATES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

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
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.business_name}</td>
                  <td>{c.slug}</td>
                  <td>{c.email}</td>
                  <td>
                    <select
                      className="template-select"
                      value={c.template_type || "shop"}
                      disabled={switchingId === c.id}
                      onChange={(e) => handleTemplateChange(c.id, e.target.value)}
                    >
                      <option value="shop">Shop</option>
                      <option value="realestate">Real Estate</option>
                    </select>
                  </td>
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