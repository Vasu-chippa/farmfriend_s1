import React, { useState, useEffect } from "react";
import axios from "axios";
import BuyerSidebar from "../../../components/BuyerSidebar";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState({ fullName: "", email: "", company: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/buyers/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching profile:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/buyers/profile",
        {
          fullName: profile.fullName,
          company: profile.company,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Profile updated!");
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-layout">
      {/* Sidebar */}
      <BuyerSidebar />

      {/* Content */}
      <div className="profile-content">
        <div className="profile-card">
          <h2>👤 My Profile</h2>
          <div className="profile-form">
            <label>
              Full Name:
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
              />
            </label>

            <label>
              Email:
              <input type="email" name="email" value={profile.email} disabled />
            </label>

            <label>
              Company:
              <input
                type="text"
                name="company"
                value={profile.company}
                onChange={handleChange}
              />
            </label>

            <button className="btn-save" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
