// src/pages/Buyer/Profile.jsx

import React, { useState, useEffect } from "react";
import API from "../../../api";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    API.get("/buyers/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setProfile(res.data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      await API.put(
        "/buyers/profile",
        {
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Profile updated!");
      setIsEditing(false);
    } catch (err) {
      alert("❌ Failed to update profile");
    }
  };

  if (loading) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-layout">
      <div className="profile-container">

        <div className="profile-card">

          {/* LEFT SIDE */}
          <div className="profile-left">
            <div className="avatar-large">
              {profile.fullName?.charAt(0).toUpperCase()}
            </div>

            <h2>{profile.fullName}</h2>
            <p className="role">Buyer</p>

            <div className="stats">
              <div>
                <span>{profile.orderCount || 0}</span>
                <p>Orders</p>
              </div>
              <div>
                <span>₹{profile.totalSpent || 0}</span>
                <p>Spent</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="profile-right">

            <div className="profile-header-row">
              <h3>Profile Details</h3>

              <button
                className="edit-btn"
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>

            <div className="info-grid">
              <label>
                Full Name
                <input
                  name="fullName"
                  value={profile.fullName || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </label>

              <label>
                Email
                <input value={profile.email || ""} disabled />
              </label>

              <label>
                Phone
                <input
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </label>

              <label>
                Address
                <input
                  name="address"
                  value={profile.address || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </label>

              <label>
                Buyer ID
                <input value={profile._id || ""} disabled />
              </label>

              <label>
                Joined
                <input
                  value={
                    profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "-"
                  }
                  disabled
                />
              </label>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;