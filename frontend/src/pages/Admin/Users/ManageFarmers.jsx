import React, { useEffect, useState } from "react";
import AdminSidebar from "../AdminSidebar";
import API from "../../../api";
import "../Users/ManageUsers.css";

const ManageFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [newFarmer, setNewFarmer] = useState({ fullName: "", email: "", password: "" });
  
  const fetchFarmers = async () => {
    try {
      const { data } = await API.get("/admins/farmers");
      setFarmers(data);
    } catch (err) {
      console.error("Error fetching farmers:", err);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

 const handleAdd = async () => {
    try {
      // EDIT HERE: Change the endpoint from the WRONG '/admin/farmers' to the CORRECT '/admins/farmers'
      await API.post("/admins/farmers", newFarmer); 
      alert("Farmer added successfully!");
      setNewFarmer({ fullName: "", email: "", password: "" });
      fetchFarmers();
    } catch (err) {
      alert("Failed to add farmer");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this farmer?")) return;
    try {
      await API.delete(`/admins/farmers/${id}`);
      fetchFarmers();
    } catch (err) {
      alert("Error deleting farmer");
    }
  };

  return (
    <div className="manage-users">
      <AdminSidebar />
      <div className="content">
        <h2>Manage Farmers</h2>

        <div className="add-form">
          <input
            placeholder="Full Name"
            value={newFarmer.fullName}
            onChange={(e) => setNewFarmer({ ...newFarmer, fullName: e.target.value })}
          />
          <input
            placeholder="Email"
            value={newFarmer.email}
            onChange={(e) => setNewFarmer({ ...newFarmer, email: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={newFarmer.password}
            onChange={(e) => setNewFarmer({ ...newFarmer, password: e.target.value })}
          />
          <button onClick={handleAdd}>Add Farmer</button>
        </div>

        <table className="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {farmers.length > 0 ? (
              farmers.map((f, i) => (
                <tr key={f._id}>
                  <td>{i + 1}</td>
                  <td>{f.fullName}</td>
                  <td>{f.email}</td>
                  <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(f._id)}>❌ Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No farmers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageFarmers;
