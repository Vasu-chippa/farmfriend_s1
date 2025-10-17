// apps/frontend/src/services/cropRecordService.js
import axios from "axios";
const API_BASE = "https://farmfriend.onrender.com/api/crop-records";
function authHeader() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}
/**
 * Get all records for a cropId
 * returns array
 */
export async function getRecords(cropId) {
  const res = await axios.get(`${API_BASE}/${cropId}`, authHeader());
  return res.data;
}
/**
 * Add a record
 * payload must include cropId and required fields
 */
export async function addRecord(payload) {
  const res = await axios.post(API_BASE, payload, authHeader());
  return res.data;
}
/**
 * Update a record by id
 */
export async function updateRecord(id, payload) {
  const res = await axios.put(`${API_BASE}/${id}`, payload, authHeader());
  return res.data;
}
/**
 * Delete record
 */
export async function deleteRecord(id) {
  const res = await axios.delete(`${API_BASE}/${id}`, authHeader());
  return res.data;
}
