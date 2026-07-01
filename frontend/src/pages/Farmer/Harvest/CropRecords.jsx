import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getRecords,
  addRecord,
  updateRecord,
  deleteRecord,
} from "../../../services/cropRecordService";
import API, { getBackendImageUrl } from "../../../api";
import logger from '../../../utils/logger';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CropRecords.css";
import Chart from "../../../components/Chart";
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiPackage, FiList, FiMap } from 'react-icons/fi';

const CropRecords = () => {
  const { cropId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!cropId) return;
    if (!/^[0-9a-fA-F]{24}$/.test(cropId)) {
      toast.info('Please select or create a crop first');
      navigate('/farmer/crops', { replace: true });
    }
  }, [cropId, navigate]);

  const [crop, setCrop]           = useState(null);
  const [records, setRecords]     = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [cropAcres, setCropAcres] = useState(0);

  const [formData, setFormData] = useState({
    cropId: cropId || "", date: "", cost: "", quantity: "", description: "",
    fertilizer: "", seeds: "", workers: "", transportCost: "",
    recordType: 'cost', activityType: '', hours: '', amountSpent: '', notes: '',
  });

  const fetchCrop = useCallback(async () => {
    if (!cropId || cropId === 'new') return;
    try {
      const res = await API.get(`/crops/${cropId}`);
      setCrop(res.data); setCropAcres(res.data.acres || 0);
    } catch {
      try {
        const res2 = await API.get(`/harvest/${cropId}`);
        setCrop(res2.data); setCropAcres(res2.data.acres || 0);
      } catch (e2) { logger.error("Fetch crop:", e2); setCrop(null); }
    }
  }, [cropId]);

  const fetchRecords = useCallback(async () => {
    if (!cropId || cropId === 'new') return;
    try { setRecords(await getRecords(cropId)); }
    catch (e) { logger.error("Fetch records:", e); }
  }, [cropId]);

  useEffect(() => { fetchCrop(); fetchRecords(); }, [fetchCrop, fetchRecords]);

  const summary = useMemo(() => ({
    totalCost:     records.reduce((s, r) => s + Number(r.cost || r.amountSpent || 0), 0),
    totalQuantity: records.reduce((s, r) => s + Number(r.quantity || 0), 0),
    numRecords:    records.length,
  }), [records]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const resetFormFields = () => {
    setFormData({ cropId, date: "", cost: "", quantity: "", description: "",
      fertilizer: "", seeds: "", workers: "", transportCost: "",
      recordType: 'cost', activityType: '', hours: '', amountSpent: '', notes: '' });
    setEditingRecord(null); setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) { toast.error("Please select a valid date."); return; }
    if (saving) return;
    setSaving(true);
    try {
      const payload = { ...formData, cropId };
      if (editingRecord) {
        const updated = await updateRecord(editingRecord._id, payload);
        setRecords(prev => prev.map(r => r._id === updated._id ? updated : r));
        toast.success("Record updated.");
      } else {
        const created = await addRecord(payload);
        setRecords(prev => [created, ...prev]);
        toast.success("Record added.");
      }
      resetFormFields();
    } catch (e) { logger.error("Save:", e); toast.error("Failed to save."); }
    finally { setSaving(false); }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      cropId,
      date:         record.date ? new Date(record.date).toISOString().slice(0, 10) : "",
      cost:         record.cost || "", quantity: record.quantity || "",
      description:  record.description || "", fertilizer: record.fertilizer || "",
      seeds:        record.seeds || "", workers: record.workers || "",
      transportCost:record.transportCost || "",
      recordType:   record.recordType || (record.cost !== undefined ? 'cost' : 'activity'),
      activityType: record.activityType || '', hours: record.hours || '',
      amountSpent:  record.amountSpent || '', notes: record.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try { await deleteRecord(id); setRecords(prev => prev.filter(r => r._id !== id)); toast.success("Deleted."); }
    catch (e) { logger.error("Delete:", e); }
  };

  const cropImgSrc = crop?.image
    ? getBackendImageUrl(crop.image)
    : `${process.env.PUBLIC_URL}/cropimages/default.jpeg`;

  return (
    <div className="cr-root">
      <div className="cr-container">

        {/* Header Element */}
        <header className="cr-header">
          <div className="cr-head-left">
            <h1>📋 Crop Records Hub</h1>
            <p className="cr-subtitle">Track metrics, volumetric inventory indices, execution tasks, and operational payouts.</p>
          </div>
          <button className="cr-btn-primary" onClick={() => showForm ? resetFormFields() : setShowForm(true)}>
            <FiPlus /> {showForm ? 'Hide Logger' : 'Log Operational Segment'}
          </button>
        </header>

        {/* Hero Matrix */}
        <section className="cr-hero-matrix">
          <div className="cr-crop-card">
            <div className="cr-crop-img-wrap">
              <img src={cropImgSrc} alt="crop" className="cr-crop-img"
                onError={e => { e.target.onerror = null; e.target.src = `${process.env.PUBLIC_URL}/cropimages/default.jpeg`; }} />
            </div>
            <div className="cr-crop-info">
              <h2>🌾 {crop?.name || 'Loading...'}</h2>
              <div className="cr-meta-grid">
                <div><strong>Category Domain:</strong> {crop?.category || 'General Cultivation'}</div>
                <div><strong>Timeline Cycle:</strong> {crop?.season || 'Active Framework'}</div>
                <div><strong>Sowing Index:</strong> {crop?.sowingTime || crop?.sowing || 'N/A'}</div>
                <div><strong>Baseline Evaluation:</strong> ₹{crop?.price || '0'}/kg</div>
                <div><strong>In-Stock Volume:</strong> {crop?.quantity || '0'} kg</div>
                <div><strong>Classification:</strong> {crop?.quality || (crop?.isOrganic ? 'Organic' : 'Standard Grade')}</div>
              </div>
            </div>
          </div>

          <div className="cr-kpi-grid">
            {[
              { icon: <FiDollarSign />, cls: 'cr-kpi-green', label: 'FUNDS INVESTED',      val: `₹${summary.totalCost.toLocaleString()}` },
              { icon: <FiPackage />,    cls: 'cr-kpi-blue',  label: 'VOLUME OUTPUT',       val: `${summary.totalQuantity.toLocaleString()} kg` },
              { icon: <FiList />,       cls: 'cr-kpi-purple',label: 'INDEXED ENTRIES',     val: `${summary.numRecords} Segments` },
              { icon: <FiMap />,        cls: 'cr-kpi-amber', label: 'VOLUMETRIC FOOTPRINT',val: cropAcres ? `${cropAcres} Acres` : '—' },
            ].map(k => (
              <div className="cr-kpi-card" key={k.label}>
                <div className={`cr-kpi-icon ${k.cls}`}>{k.icon}</div>
                <div>
                  <div className="cr-kpi-label">{k.label}</div>
                  <div className="cr-kpi-value">{k.val}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Workspace Panels */}
        <div className="cr-workspace">

          {/* Left Column Fields */}
          <div className="cr-col">
            {showForm && (
              <div className="cr-card">
                <div className="cr-card-title">Log Operational Segment</div>
                <form onSubmit={handleSubmit} className="cr-inline-form">
                  <div className="cr-form-row-inline">
                    <div className="cr-field">
                      <label>Date</label>
                      <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="cr-field">
                      <label>Record Type</label>
                      <select name="recordType" value={formData.recordType} onChange={handleChange}>
                        <option value="cost">Cost Record</option>
                        <option value="activity">Activity</option>
                      </select>
                    </div>
                  </div>

                  {formData.recordType === 'cost' ? (
                    <div className="cr-form-row-inline">
                      <div className="cr-field">
                        <label>Cost Value (₹)</label>
                        <input type="number" name="cost" value={formData.cost} onChange={handleChange} required />
                      </div>
                      <div className="cr-field">
                        <label>Quantity (kg)</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="cr-form-row-inline">
                        <div className="cr-field">
                          <label>Activity Type</label>
                          <select name="activityType" value={formData.activityType} onChange={handleChange} required>
                            <option value="">Select Activity</option>
                            {['Seeding','Planting','Irrigation','Fertilizer','Pesticide','Weeding','Harvesting','Transportation','Other'].map(a =>
                              <option key={a} value={a}>{a}</option>
                            )}
                          </select>
                        </div>
                        <div className="cr-field">
                          <label>Workers</label>
                          <input type="number" name="workers" value={formData.workers} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="cr-form-row-inline">
                        <div className="cr-field">
                          <label>Hours</label>
                          <input type="number" step="0.1" name="hours" value={formData.hours} onChange={handleChange} />
                        </div>
                        <div className="cr-field">
                          <label>Amount Spent (₹)</label>
                          <input type="number" name="amountSpent" value={formData.amountSpent} onChange={handleChange} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="cr-form-actions">
                    <button type="button" className="cr-cancel-btn" onClick={resetFormFields}>Cancel</button>
                    <button type="submit" className="cr-submit-btn" disabled={saving}>
                      {saving ? 'Saving…' : 'Submit Record'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="cr-card">
              <div className="cr-card-title">Log &amp; Activity Manager</div>
              <div className="cr-table-wrap">
                <table className="cr-table">
                  <thead>
                    <tr>
                      <th>Crop</th><th>Type / Cycle</th><th>Notes / Sowing</th><th>Stock Delta</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? records.map(r => (
                      <tr key={r._id}>
                        <td>
                          <div className="cr-crop-thumb-wrap">
                            <img src={cropImgSrc} alt="crop" className="cr-crop-thumb" />
                            <span>{crop?.name || 'Loading...'}</span>
                          </div>
                        </td>
                        <td>{r.recordType === 'activity' ? (r.activityType || 'General') : 'Cost Entry'}</td>
                        <td className="cr-td-muted">{r.recordType === 'activity' ? (r.notes || '—') : (r.description || '—')}</td>
                        <td className="cr-td-stock">{r.quantity ? `${r.quantity} kg` : '—'}</td>
                        <td className="cr-td-actions">
                          <button className="cr-icon-btn" onClick={() => handleEdit(r)}><FiEdit2 /></button>
                          <button className="cr-icon-btn cr-icon-btn-del" onClick={() => handleDelete(r._id)}><FiTrash2 /></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="cr-empty">No entries logged yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column Layout */}
          <div className="cr-col">
            <div className="cr-card">
              <div className="cr-card-title">Performance Metrics</div>
              <div className="cr-chart-box">
                <Chart />
              </div>
            </div>

            <div className="cr-card">
              <div className="cr-card-title">Timeline Stream</div>
              <div className="cr-timeline-table-wrap">
                <table className="cr-timeline-table">
                  <thead>
                    <tr><th>Log Entry</th><th>Fiscal</th><th>Delta</th></tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={`tl-${r._id}`}>
                        <td>
                          <div className="cr-tl-dot-row">
                            <span className="cr-tl-dot" />
                            <div>
                              <div className="cr-tl-title">{r.activityType || 'Inventory Segment'}</div>
                              <div className="cr-tl-date">{new Date(r.date).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="cr-tl-fiscal">₹{r.cost || r.amountSpent || 0}</td>
                        <td className="cr-tl-weight">{r.quantity || 0} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default CropRecords;