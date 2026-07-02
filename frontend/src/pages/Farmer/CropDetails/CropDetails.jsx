// // src/pages/Farmer/CropDetails.jsx
// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import "./CropDetails.css";

// const CropDetails = () => {
//   const { id } = useParams();
//   const token = localStorage.getItem("token");

//   const [crop, setCrop] = useState(null);
//   const [records, setRecords] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [editingRecord, setEditingRecord] = useState(null);

//   const [formData, setFormData] = useState({
//     cropId: id,
//     name: "",
//     cost: "",
//     quantity: "",
//     date: "",
//     description: "",
//     fertilizer: "",
//     weather: "",
//   });

//   // Fetch crop + records
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/api/harvest/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setCrop(res.data);
//         setFormData((f) => ({ ...f, name: res.data.name }));

//         const rec = await axios.get(
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setRecords(rec.data);
//       } catch (err) {
//         console.error("❌ Error:", err);
//       }
//     };
//     fetchData();
//   }, [id, token]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingRecord) {
//         const res = await axios.put(
//           formData,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setRecords(records.map((r) => (r._id === res.data._id ? res.data : r)));
//         setEditingRecord(null);
//       } else {
//         const res = await axios.post(
//           formData,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setRecords([...records, res.data]);
//       }

//       setShowForm(false);
//       setFormData({
//         cropId: id,
//         name: crop?.name || "",
//         cost: "",
//         quantity: "",
//         date: "",
//         description: "",
//         fertilizer: "",
//         weather: "",
//       });
//     } catch (err) {
//       console.error("❌ Error saving record:", err);
//     }
//   };

//   const handleEdit = (record) => {
//     setEditingRecord(record);
//     setFormData(record);
//     setShowForm(true);
//   };

//   const handleDelete = async (recordId) => {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     setRecords(records.filter((r) => r._id !== recordId));
//   };

//   return (
//     <div className="crop-details">
//       {crop ? (
//         <>
//           {/* Crop Header */}
//           <motion.div
//             className="crop-header"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//           >
//             <motion.img
//               whileHover={{ scale: 1.05 }}
//               transition={{ duration: 0.3 }}
//               src={crop.image}
//               alt={crop.name}
//               className="crop-image"
//             />
//             <div>
//               <h2>🌾 {crop.name}</h2>
//               <p>📦 Quantity: {crop.quantity} kg</p>
//               <p>💰 Price: ₹{crop.price}/kg</p>
//               <p>🌿 Quality: {crop.quality || "Organic"}</p>
//             </div>
//           </motion.div>

//           {/* Add Record Button */}
//           <button onClick={() => setShowForm(!showForm)} className="add-btn">
//             {showForm ? "✖ Cancel" : "➕ Add Record"}
//           </button>

//           {/* Form with Animation */}
//           <AnimatePresence>
//             {showForm && (
//               <motion.form
//                 onSubmit={handleSubmit}
//                 className="record-form"
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <input type="text" name="name" value={formData.name} readOnly />
//                 <input
//                   type="number"
//                   name="cost"
//                   placeholder="Cost Spent (₹)"
//                   value={formData.cost}
//                   onChange={handleChange}
//                   required
//                 />
//                 <input
//                   type="number"
//                   name="quantity"
//                   placeholder="Quantity (kg)"
//                   value={formData.quantity}
//                   onChange={handleChange}
//                 />
//                 <input
//                   type="date"
//                   name="date"
//                   value={formData.date}
//                   onChange={handleChange}
//                   required
//                 />
//                 <textarea
//                   name="description"
//                   placeholder="Description"
//                   value={formData.description}
//                   onChange={handleChange}
//                 ></textarea>
//                 <input
//                   type="text"
//                   name="fertilizer"
//                   placeholder="Fertilizer Used"
//                   value={formData.fertilizer}
//                   onChange={handleChange}
//                 />
//                 <input
//                   type="text"
//                   name="weather"
//                   placeholder="Weather Condition"
//                   value={formData.weather}
//                   onChange={handleChange}
//                 />
//                 <button type="submit" className="save-btn">
//                   {editingRecord ? "💾 Update" : "✅ Save"}
//                 </button>
//               </motion.form>
//             )}
//           </AnimatePresence>

//           {/* Records Table */}
//           <h3>📑 Records</h3>
//           {records.length > 0 ? (
//             <motion.table
//               className="records-table"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.5 }}
//             >
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Cost (₹)</th>
//                   <th>Qty</th>
//                   <th>Description</th>
//                   <th>Fertilizer</th>
//                   <th>Weather</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <AnimatePresence>
//                   {records.map((r) => (
//                     <motion.tr
//                       key={r._id}
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -10 }}
//                     >
//                       <td>{new Date(r.date).toLocaleDateString()}</td>
//                       <td>{r.cost}</td>
//                       <td>{r.quantity}</td>
//                       <td>{r.description}</td>
//                       <td>{r.fertilizer}</td>
//                       <td>{r.weather}</td>
//                       <td>
//                         <button
//                           className="icon-btn edit"
//                           onClick={() => handleEdit(r)}
//                         >
//                           ✏
//                         </button>
//                         <button
//                           className="icon-btn delete"
//                           onClick={() => handleDelete(r._id)}
//                         >
//                           🗑
//                         </button>
//                       </td>
//                     </motion.tr>
//                   ))}
//                 </AnimatePresence>
//               </tbody>
//             </motion.table>
//           ) : (
//             <p className="empty">⚠ No records yet</p>
//           )}
//         </>
//       ) : (
//         <p className="empty">❌ No crop found</p>
//       )}
//     </div>
//   );
// };

// export default CropDetails;
