import React, { useState } from "react";
import API from "../../../api";

const AddModal = ({ role, onClose, onAdded }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    landSize: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/farmers", formData);
      alert(`${role} added successfully`);
      onAdded(); // refresh list
      onClose(); // close modal
    } catch (err) {
      console.error(err);
      alert(`Failed to add ${role}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add {role.charAt(0).toUpperCase() + role.slice(1)}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {role === "farmer" && (
            <input
              type="number"
              name="landSize"
              placeholder="Land Size (acres)"
              value={formData.landSize}
              onChange={handleChange}
            />
          )}
          <div className="modal-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
