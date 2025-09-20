// apps/frontend/src/pages/Farmer/Marketplace/FarmerMarketplace.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./FarmerMarketplace.css";

function FarmerMarketplace() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    quality: "A",
    organic: false,
    images: []
  });

  // Fetch farmer’s products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/farmers/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, images: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "images") {
        for (let i = 0; i < formData.images.length; i++) {
          data.append("images", formData.images[i]);
        }
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem("token");
      if (editProduct) {
        await axios.put(
          `http://localhost:5000/api/farmers/products/${editProduct._id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("✅ Product updated!");
      } else {
        await axios.post("http://localhost:5000/api/farmers/products", data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("✅ Product added!");
      }

      setFormData({
        name: "",
        description: "",
        price: "",
        quantity: "",
        quality: "A",
        organic: false,
        images: []
      });
      setEditProduct(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error("Error saving product", err);
      alert("❌ Error saving product");
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      quality: product.quality,
      organic: product.organic,
      images: []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/farmers/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("🗑️ Product deleted!");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product", err);
      alert("❌ Error deleting product");
    }
  };

  return (
    <div className="marketplace-container">
      <div className="header">
        <h2>🌾 Farmer Marketplace</h2>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          + Add Product
        </button>
      </div>

      {/* Product Cards */}
      <div className="product-list">
        {products.length > 0 ? (
          products.map((p) => (
            <div
              key={p._id}
              className="product-card clickable"
              onClick={() => navigate(`/farmer/marketplace/${p._id}`)}
            >
              <img
                src={p.images?.[0] ? `http://localhost:5000${p.images[0]}` : "/default-crop.jpg"}
                alt={p.name}
                className="product-img"
              />
              <div className="product-details">
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p><strong>Price:</strong> ₹{p.price}</p>
                <p><strong>Qty:</strong> {p.quantity} kg</p>
                <p><strong>Quality:</strong> {p.quality}</p>
                <p>{p.organic ? "🌱 Organic" : "❌ Non-Organic"}</p>

                {/* Edit/Delete */}
                <div className="actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(p);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p._id);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No products yet. Add one above!</p>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editProduct ? "✏️ Edit Product" : "➕ Add Product"}</h3>
            <form onSubmit={handleSubmit} className="product-form">
              <input type="text" name="name" placeholder="Crop Name" value={formData.name} onChange={handleChange} required />
              <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
              <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
              <input type="number" name="quantity" placeholder="Quantity (kg)" value={formData.quantity} onChange={handleChange} required />
              <select name="quality" value={formData.quality} onChange={handleChange}>
                <option value="A">A (Excellent)</option>
                <option value="B">B (Good)</option>
                <option value="C">C (Average)</option>
              </select>
              <label>
                <input type="checkbox" name="organic" checked={formData.organic} onChange={handleChange} />
                Organic
              </label>
              <input type="file" name="images" multiple onChange={handleChange} />

              <div className="image-preview">
                {formData.images &&
                  Array.from(formData.images).map((file, index) => (
                    <img key={index} src={URL.createObjectURL(file)} alt="preview" className="preview-thumb" />
                  ))}
              </div>

              <div className="form-actions">
                <button type="submit">{editProduct ? "Update" : "Add"}</button>
                <button type="button" className="cancel-btn" onClick={() => { setShowForm(false); setEditProduct(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerMarketplace;
