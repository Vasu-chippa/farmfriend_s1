import React, { useEffect, useState } from "react";
// Sidebar provided by AdminLayout
import API from "../../../api";
import "./ManageProducts.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [newProd, setNewProd] = useState({ name: "", category: "", price: 0 });

  const fetchProducts = async () => {
    try {
    const { data } = await API.get("/admins/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async () => {
    try {
     await API.post("/admins/products", newProd);

      fetchProducts();
      setNewProd({ name: "", category: "", price: 0 });
    } catch (err) {
      alert("Failed to add product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete product?")) return;
    try {
      await API.delete(`/admins/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Error deleting product");
    }
  };

  const handleApproval = async (product) => {
    try {
      await API.put(`/admins/products/${product._id}/approve`, {
        approved: !product.approved,
      });
      await fetchProducts();
    } catch (err) {
      alert("Failed to update product approval");
    }
  };

  return (
    <div className="manage-products">
      <div className="content">
        <h2>Manage Products</h2>

        <div className="add-form">
          <input placeholder="Name" value={newProd.name}
            onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} />
          <input placeholder="Category" value={newProd.category}
            onChange={(e) => setNewProd({ ...newProd, category: e.target.value })} />
          <input placeholder="Price" type="number" value={newProd.price}
            onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} />
          <button onClick={handleAdd}>Add Product</button>
        </div>

        <table className="products-table">
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Category</th><th>Price</th><th>Marketplace</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p._id}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>
                  <button
                    className={p.approved ? "approval-btn approved" : "approval-btn"}
                    onClick={() => handleApproval(p)}
                  >
                    {p.approved ? "Approved" : "Approve"}
                  </button>
                </td>
                <td><button onClick={() => handleDelete(p._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProducts;
