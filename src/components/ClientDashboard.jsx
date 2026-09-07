import React, { useState, useEffect } from "react";
import { uploadImage } from "../utils/uploadImage";
import "./ClientDashboard.css";

const API_BASE_URL = "https://cbe-quicksite-backend.onrender.com";
const DESCRIPTION_MAX_LENGTH = 40;

function ClientDashboard({ user }) {
  const [businessName, setBusinessName] = useState(user.business_name || "");
  const [homeText, setHomeText] = useState(user.home_text || "");
  const [aboutText, setAboutText] = useState(user.about_text || "");
  const [contactPhone, setContactPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [address, setAddress] = useState(user.address || "");
  const [logoUrl, setLogoUrl] = useState(user.logo_url || "");
  const [heroUrl, setHeroUrl] = useState(user.hero_url || "");

  const [facebook, setFacebook] = useState(user.social_facebook || "");
  const [instagram, setInstagram] = useState(user.social_instagram || "");
  const [whatsapp, setWhatsapp] = useState(user.social_whatsapp || "");
  const [tiktok, setTiktok] = useState(user.social_tiktok || "");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [listingTitle, setListingTitle] = useState("");
  const [listingDescription, setListingDescription] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [listingImageUrl, setListingImageUrl] = useState("");
  const [uploadingListingImage, setUploadingListingImage] = useState(false);
  const [savingListing, setSavingListing] = useState(false);
  const [listingError, setListingError] = useState("");

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadImage(file);
      setLogoUrl(url);
    } catch (err) {
      console.error("Logo upload failed:", err);
      setError("Logo upload failed. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleHeroChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const url = await uploadImage(file);
      setHeroUrl(url);
    } catch (err) {
      console.error("Background upload failed:", err);
      setError("Background image upload failed. Please try again.");
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE_URL}/clients/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          home_text: homeText,
          about_text: aboutText,
          phone: contactPhone,
          email: email,
          address: address,
          logo_url: logoUrl,
          hero_url: heroUrl,
          social_facebook: facebook,
          social_instagram: instagram,
          social_whatsapp: whatsapp,
          social_tiktok: tiktok,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to save changes.");
        setSaving(false);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const res = await fetch(`${API_BASE_URL}/listings/client/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetListingForm = () => {
    setEditingId(null);
    setListingTitle("");
    setListingDescription("");
    setListingPrice("");
    setListingImageUrl("");
    setListingError("");
  };

  const handleListingImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingListingImage(true);
    try {
      const url = await uploadImage(file);
      setListingImageUrl(url);
    } catch (err) {
      console.error("Listing image upload failed:", err);
      setListingError("Image upload failed. Please try again.");
    } finally {
      setUploadingListingImage(false);
    }
  };

  const handleEditClick = (listing) => {
    setEditingId(listing.id);
    setListingTitle(listing.title || "");
    setListingDescription(listing.description || "");
    setListingPrice(listing.price || "");
    setListingImageUrl(
      listing.media_urls && listing.media_urls.length > 0 ? listing.media_urls[0] : ""
    );
    setListingError("");
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/listings/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Failed to delete listing.");
        return;
      }

      fetchListings();
      if (editingId === id) resetListingForm();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong deleting this listing.");
    }
  };

  const handleListingSubmit = async (e) => {
    e.preventDefault();
    setListingError("");

    if (!listingTitle) {
      setListingError("Please enter a title.");
      return;
    }

    setSavingListing(true);

    try {
      const isEditing = editingId !== null;
      const url = isEditing
        ? `${API_BASE_URL}/listings/${editingId}`
        : `${API_BASE_URL}/listings`;
      const method = isEditing ? "PUT" : "POST";

      const body = {
        title: listingTitle,
        description: listingDescription,
        price: listingPrice,
        media_urls: listingImageUrl ? [listingImageUrl] : [],
      };

      if (!isEditing) {
        body.client_id = user.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setListingError(data.error || "Failed to save listing.");
        setSavingListing(false);
        return;
      }

      resetListingForm();
      fetchListings();
    } catch (err) {
      console.error("Listing save error:", err);
      setListingError("Something went wrong. Please try again.");
    } finally {
      setSavingListing(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {businessName}</h1>
        <p>Manage your website content below</p>
      </header>

      <form className="dashboard-form" onSubmit={handleSave}>
        {error && <p className="save-error">{error}</p>}

        <label>Business Name</label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <label>Home Page Tagline</label>
        <textarea
          rows="2"
          value={homeText}
          onChange={(e) => setHomeText(e.target.value)}
          placeholder="A short, punchy line for your homepage banner..."
        />

        <label>About Text</label>
        <textarea
          rows="4"
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          placeholder="Tell customers about your business..."
        />

        <label>Contact Phone</label>
        <input
          type="text"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="08012345678"
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com"
        />

        <label>Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="12 Allen Avenue, Ikeja, Lagos"
        />

        <label>Facebook Link</label>
        <input
          type="text"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          placeholder="https://facebook.com/yourbusiness"
        />

        <label>Instagram Link</label>
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="https://instagram.com/yourbusiness"
        />

        <label>TikTok Link</label>
        <input
          type="text"
          value={tiktok}
          onChange={(e) => setTiktok(e.target.value)}
          placeholder="https://tiktok.com/@yourbusiness"
        />

        <label>WhatsApp Number</label>
        <input
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="08012345678"
        />

        <label>Logo</label>
        <input type="file" accept="image/*" onChange={handleLogoChange} />
        {uploadingLogo && <p>Uploading logo...</p>}
        {logoUrl && <img src={logoUrl} alt="Logo preview" className="preview-image preview-logo" />}

        <label>Background Image</label>
        <input type="file" accept="image/*" onChange={handleHeroChange} />
        {uploadingHero && <p>Uploading background image...</p>}
        {heroUrl && <img src={heroUrl} alt="Background preview" className="preview-image preview-hero" />}

        <button type="submit" disabled={saving || uploadingLogo || uploadingHero}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && <p className="save-success">Saved successfully!</p>}
      </form>

      <section className="dashboard-listings">
        <h2>My Products/Services</h2>

        {loadingListings ? (
          <p>Loading listings...</p>
        ) : listings.length === 0 ? (
          <p className="listings-empty">No listings yet. Add your first one below.</p>
        ) : (
          <div className="listings-list">
            {listings.map((item) => (
              <div key={item.id} className="listing-card">
                {item.media_urls && item.media_urls[0] && (
                  <img src={item.media_urls[0]} alt={item.title} className="listing-thumbnail" />
                )}
                <div className="listing-info">
                  <strong>{item.title}</strong>
                  <p className="listing-description">{item.description}</p>
                  {item.price && <p className="listing-price">₦{Number(item.price).toLocaleString()}</p>}
                </div>
                <div className="listing-actions">
                  <button type="button" onClick={() => handleEditClick(item)}>Edit</button>
                  <button type="button" onClick={() => handleDeleteListing(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h3>{editingId ? "Edit Listing" : "Add New Listing"}</h3>
        <form onSubmit={handleListingSubmit} className="listing-form">
          {listingError && <p className="save-error">{listingError}</p>}

          <label>Title</label>
          <input
            type="text"
            value={listingTitle}
            onChange={(e) => setListingTitle(e.target.value)}
            placeholder="e.g. Luxury Gel Manicure"
          />

          <label>Description ({listingDescription.length}/{DESCRIPTION_MAX_LENGTH})</label>
          <textarea
            rows="3"
            maxLength={DESCRIPTION_MAX_LENGTH}
            value={listingDescription}
            onChange={(e) => setListingDescription(e.target.value)}
            placeholder="Short description (max 40 characters)..."
          />

          <label>Price</label>
          <input
            type="number"
            value={listingPrice}
            onChange={(e) => setListingPrice(e.target.value)}
            placeholder="12000"
          />

          <label>Image</label>
          <input type="file" accept="image/*" onChange={handleListingImageChange} />
          {uploadingListingImage && <p>Uploading image...</p>}
          {listingImageUrl && (
            <img src={listingImageUrl} alt="Listing preview" className="preview-image preview-listing" />
          )}

          <div className="listing-form-actions">
            <button type="submit" disabled={savingListing || uploadingListingImage}>
              {savingListing ? "Saving..." : editingId ? "Update Listing" : "Add Listing"}
            </button>
            {editingId && (
              <button type="button" onClick={resetListingForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

export default ClientDashboard;