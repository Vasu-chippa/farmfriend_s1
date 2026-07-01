import React, { useEffect, useState, useMemo } from "react";
import API from "../../../api";
import { getAuthHeaders } from "../../../utils/auth";
import { useNavigate } from "react-router-dom";
import "./Harvest.css";

const DEFAULT_COMMISSION = 5;

const uid = () => `local-${Math.random().toString(36).slice(2, 9)}`;

const loadLocal = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};

const saveLocal = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {};
};

const HarvestList = () => {
  const [backendCrops, setBackendCrops] = useState([]);
  const [localCrops, setLocalCrops] = useState(loadLocal('harvestList'));
  const [removed, setRemoved] = useState(loadLocal('removedHarvests'));
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [animateModal, setAnimateModal] = useState(false);
  const [form, setForm] = useState({
    crop: '', variety:'', farmName:'', village:'', district:'', state:'', acres:'', quantity:'', yieldPerAcre:'', harvestDate:'', season:'', expectedPriceKg:'', notes:'', isMarketplaceListed:false
  });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHarvest = async () => {
      try {
        const res = await API.get('/harvest', { headers: getAuthHeaders() }).catch(()=>({ data: { crops: [] }}));
        const crops = res.data.crops || [];
        setBackendCrops(crops.map(c => ({ ...c, __source: 'backend' })));
      } catch (err) {
        console.error('Error fetching harvest', err);
        setBackendCrops([]);
      } finally { setLoading(false); }
    };
    fetchHarvest();
  }, []);

  const unified = useMemo(() => {
    const backend = backendCrops || [];
    const local = localCrops || [];
    const removedIds = new Set(removed.map(r=>r.id));
    const filteredBackend = backend.filter(b => !removedIds.has(b._id));
    const filteredLocal = local.filter(l => !removedIds.has(l.id));
    return [...filteredLocal, ...filteredBackend];
  }, [backendCrops, localCrops, removed]);

  const stats = useMemo(() => {
    const totalHarvests = unified.length;
    const totalAcres = unified.reduce((s, it)=> s + (Number(it.acres) || it.cropId?.acres || 0), 0);
    const totalQuantity = unified.reduce((s, it)=> s + (Number(it.quantity) || it.cropId?.quantity || 0), 0);
    const expectedRevenue = unified.reduce((s, it)=> {
      const qty = Number(it.quantity) || it.cropId?.quantity || 0;
      const price = Number(it.expectedPriceKg) || it.expectedPrice || it.cropId?.price || 0;
      return s + qty * price;
    }, 0);
    const listed = unified.filter(i => i.isMarketplaceListed || i.cropId?.isMarketplaceListed).length;
    return { totalHarvests, totalAcres, totalQuantity, expectedRevenue, listed };
  }, [unified]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const openAdd = () => { 
    setForm({crop:'', variety:'', farmName:'', village:'', district:'', state:'', acres:'', quantity:'', yieldPerAcre:'', harvestDate:'', season:'', expectedPriceKg:'', notes:'', isMarketplaceListed:false}); 
    setShowAddModal(true);
    setTimeout(() => setAnimateModal(true), 10);
  };

  const closeAdd = () => {
    setAnimateModal(false);
    setTimeout(() => setShowAddModal(false), 200);
  };

  const addLocalHarvest = (payload) => {
    const entry = { id: uid(), ...payload, commissionPercent: DEFAULT_COMMISSION };
    entry.commissionAmount = ((Number(entry.quantity)||0) * (Number(entry.expectedPriceKg)||0)) * (entry.commissionPercent/100);
    const next = [entry, ...localCrops];
    setLocalCrops(next); saveLocal('harvestList', next);
    closeAdd();
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const existingBackend = backendCrops.find(b => b.cropId && b.cropId.name && b.cropId.name.toLowerCase() === (form.crop||'').toLowerCase());
    if (existingBackend) {
      const same = backendCrops.some(b => b.cropId._id === existingBackend.cropId._id);
      if (same && (form.farmName || form.acres)) {
        addLocalHarvest({ cropId: existingBackend.cropId._id, name: existingBackend.cropId.name, variety: form.variety, farmName: form.farmName, village: form.village, district: form.district, state: form.state, acres: form.acres, quantity: form.quantity, yieldPerAcre: form.yieldPerAcre, harvestDate: form.harvestDate, season: form.season, expectedPriceKg: form.expectedPriceKg, notes: form.notes, isMarketplaceListed: form.isMarketplaceListed });
        return;
      }
    }
    addLocalHarvest({ cropId: null, name: form.crop, variety: form.variety, farmName: form.farmName, village: form.village, district: form.district, state: form.state, acres: form.acres, quantity: form.quantity, yieldPerAcre: form.yieldPerAcre, harvestDate: form.harvestDate, season: form.season, expectedPriceKg: form.expectedPriceKg, notes: form.notes, isMarketplaceListed: form.isMarketplaceListed });
  };

  const handleRemove = (entry) => {
    const removedEntry = { ...entry, removedAt: new Date().toISOString(), id: entry.id || entry._id };
    const nextRemoved = [removedEntry, ...removed];
    setRemoved(nextRemoved); saveLocal('removedHarvests', nextRemoved);
    if (entry.id && entry.id.startsWith('local')) {
      const remaining = localCrops.filter(l => l.id !== entry.id);
      setLocalCrops(remaining); saveLocal('harvestList', remaining);
    }
  };

  const restoreRemoved = (r) => {
    const id = r.id;
    const remaining = removed.filter(x => x.id !== id);
    setRemoved(remaining); saveLocal('removedHarvests', remaining);
    if (id && id.startsWith('local')) {
      const restored = { ...r }; delete restored.removedAt;
      const next = [restored, ...localCrops]; setLocalCrops(next); saveLocal('harvestList', next);
    }
  };

  const deletePermanently = async (r) => {
    if (r._id) {
      try {
        await API.delete(`/harvest/${r._id}`, { headers: getAuthHeaders() });
      } catch (err) {
        console.error('Error deleting permanently', err);
      }
    }
    const remaining = removed.filter(x => x.id !== (r.id||r._id));
    setRemoved(remaining); saveLocal('removedHarvests', remaining);
  };

  const filtered = unified.filter(it => (it.cropId?.name || it.name || '').toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="harvest-loader-container">
        <div className="harvest-spinner"></div>
        <p>Syncing Farm Registry...</p>
      </div>
    );
  }

  return (
    <div className="harvest-root">
      <header className="harvest-top">
        <div className="harvest-brand">
          <h1>Harvest Management</h1>
          <p className="harvest-sub">Modern farm ERP — manage harvests, revenue assets, and digital market listings.</p>
        </div>
        <div className="harvest-stats">
          <div className="stat-card">
            <span className="stat-label">Total Harvests</span>
            <span className="stat-value">{stats.totalHarvests}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Area</span>
            <span className="stat-value">{stats.totalAcres} <small>Acres</small></span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Weight</span>
            <span className="stat-value">{stats.totalQuantity.toLocaleString()} <small>kg</small></span>
          </div>
          <div className="stat-card valuation">
            <span className="stat-label">Projected Valuation</span>
            <span className="stat-value">₹{stats.expectedRevenue.toLocaleString()}</span>
          </div>
          <div className="stat-card listing">
            <span className="stat-label">Live Listed</span>
            <span className="stat-value">{stats.listed}</span>
          </div>
        </div>
      </header>

      <div className="harvest-controls">
        <div className="search-filter-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input className="search-input" placeholder="Search crop registry, metrics or locations..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <button className="btn-primary ripple" onClick={openAdd}>
          <span className="btn-icon">+</span> Add New Harvest
        </button>
      </div>

      <section className="harvest-cards">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>No Active Harvest Records Found</h3>
            <p>Try resetting your search query or log a new seasonal harvest payload into your system.</p>
          </div>
        ) : filtered.map((it)=>{
          const id = it.id || it._id;
          const cropName = it.name || it.cropId?.name || 'Unknown';
          const variety = it.variety || it.cropId?.variety || 'Standard';
          const farmName = it.farmName || it.farm || 'Main Area';
          const location = `${it.village||'N/A'}, ${it.district||it.cropId?.category||'N/A'}`;
          const acres = it.acres || it.cropId?.acres || '0';
          const quantity = it.quantity || it.cropId?.quantity || 0;
          const yieldPer = it.yieldPerAcre || (acres && quantity ? (quantity / acres).toFixed(1) : '0');
          const price = it.expectedPriceKg || it.expectedPrice || it.cropId?.price || 0;
          const expected = (Number(quantity)||0) * (Number(price)||0);
          const season = it.season || it.cropId?.season || 'Kharif';
          const harvestDate = it.harvestDate || it.cropId?.harvestDate || '-';
          const isListed = it.isMarketplaceListed || it.cropId?.isMarketplaceListed;

          const alreadyBadge = it.cropId && backendCrops.some(b=>b.cropId && b.cropId._id === it.cropId._id) ? 'Cloud Synced' : null;

          return (
            <article key={id} className="harvest-card-premium" onClick={() => {
              // Navigate to crop records using the best available id
              const targetId = it.cropId?._id || it._id || it.id;
              if (targetId) navigate(`/farmer/crop-records/${targetId}`);
            }}>
              <div className="card-top-accent"></div>
              <div className="card-header-block">
                <div>
                  <div className="card-title-row">
                    <h2 className="crop-title-text">{cropName}</h2>
                    {alreadyBadge && <span className="sync-badge">{alreadyBadge}</span>}
                  </div>
                  <div className="card-meta-subtitle">{season} Layer • {harvestDate}</div>
                </div>
                <span className={`status-pill ${isListed ? 'status-active' : 'status-draft'}`}>
                  {isListed ? 'Market Live' : 'Internal'}
                </span>
              </div>

              <div className="card-metric-grid">
                <div className="metric-cell"><strong>Variety</strong><span>{variety}</span></div>
                <div className="metric-cell"><strong>Sector/Farm</strong><span>{farmName}</span></div>
                <div className="metric-cell"><strong>Spatial Area</strong><span>{acres} Ac</span></div>
                <div className="metric-cell highlight"><strong>Net Volume</strong><span>{quantity.toLocaleString()} kg</span></div>
                <div className="metric-cell"><strong>Yield Multiplier</strong><span>{yieldPer} <small>kg/Ac</small></span></div>
                <div className="metric-cell"><strong>Unit Target</strong><span>₹{price}/kg</span></div>
              </div>

              <div className="card-valuation-footer">
                <div className="valuation-summary">
                  <span className="lbl">Gross Expected Revenue</span>
                  <span className="val">₹{expected.toLocaleString()}</span>
                </div>
                <div className="location-footer-tag">
                  <svg className="loc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {location}
                </div>
              </div>

              <div className="card-actions-wrapper">
                <button className="btn-action-view" onClick={(e)=>{ e.stopPropagation(); const targetId = it.cropId?._id || it._id || it.id; if (targetId) navigate(`/farmer/crop-records/${targetId}`); }}>
                  Explore Dynamics
                </button>
                <button className="btn-action-remove" onClick={(e)=>{ e.stopPropagation(); handleRemove(it); }}>
                  Archive Record
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="charts-row">
        <div className="chart-box premium-card">
          <h3>Revenue Valuation Blueprint</h3>
          <div className="visual-mock-chart">
            <div className="mock-bar" style={{height: '40%'}}><span className="bar-tag">Wheat</span></div>
            <div className="mock-bar active" style={{height: '85%'}}><span className="bar-tag">Rice</span></div>
            <div className="mock-bar" style={{height: '60%'}}><span className="bar-tag">Cotton</span></div>
            <div className="mock-bar" style={{height: '30%'}}><span className="bar-tag">Maize</span></div>
          </div>
        </div>
        <div className="chart-box premium-card">
          <h3>Allocation Breakdown</h3>
          <div className="visual-mock-donut">
            <div className="donut-center">
              <span>Dynamic</span>
              <small>Distribution</small>
            </div>
          </div>
        </div>
      </section>

      <section className="removed-section-wrapper">
        <div className="removed-section-header">
          <h3>Archived / Safeguarded Records</h3>
          <span className="archive-counter">{removed.length} Total Logs</span>
        </div>
        {removed.length === 0 ? (
          <div className="empty-archive">No archived historical records present in current browser storage loop.</div>
        ) : (
          <div className="table-responsive-container">
            <table className="removed-table-modern">
              <thead>
                <tr>
                  <th>Crop Registry</th>
                  <th>Farm Asset</th>
                  <th>Spatial Scale</th>
                  <th>Archived Datetime</th>
                  <th style={{textAlign: 'right'}}>Restoration Management</th>
                </tr>
              </thead>
              <tbody>
                {removed.map(r=> (
                  <tr key={r.id||r._id} className="archive-row">
                    <td className="arch-crop-cell">{r.name || r.cropId?.name}</td>
                    <td>{r.farmName||r.crop||'-'}</td>
                    <td><span className="arch-badge-acres">{r.acres||r.cropId?.acres||'-'} Acres</span></td>
                    <td className="arch-time-cell">{new Date(r.removedAt).toLocaleString()}</td>
                    <td style={{textAlign: 'right'}}>
                      <div className="archive-actions">
                        <button className="btn-table-restore" onClick={()=>restoreRemoved(r)}>Rollback</button>
                        <button className="btn-table-purge" onClick={()=>deletePermanently(r)}>Purge Systemic</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showAddModal && (
        <div className={`modal-overlay-backdrop ${animateModal ? 'visible' : ''}`} onClick={closeAdd}>
          <div className={`modal-window-modern ${animateModal ? 'slide-up' : ''}`} onClick={e=>e.stopPropagation()}>
            <div className="modal-header-container">
              <div>
                <h3>Initialize Harvest Asset</h3>
                <p>Deploy a new dataset tracking cluster to the internal farm ledger.</p>
              </div>
              <button className="modal-close-x" onClick={closeAdd}>&times;</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="modal-form-modern">
              <div className="form-input-grid">
                <div className="input-block">
                  <label>Crop Name *</label>
                  <input name="crop" placeholder="e.g., Basmati Rice" value={form.crop} onChange={handleChange} required />
                </div>
                <div className="input-block">
                  <label>Botanical Variety</label>
                  <input name="variety" placeholder="e.g., Pusa 1121" value={form.variety} onChange={handleChange} />
                </div>
                <div className="input-block">
                  <label>Farm Division</label>
                  <input name="farmName" placeholder="e.g., North Sector A" value={form.farmName} onChange={handleChange} />
                </div>
                <div className="input-block">
                  <label>Village Block</label>
                  <input name="village" placeholder="e.g., Kurali" value={form.village} onChange={handleChange} />
                </div>
                <div className="input-block">
                  <label>District</label>
                  <input name="district" placeholder="e.g., Mohali" value={form.district} onChange={handleChange} />
                </div>
                <div className="input-block">
                  <label>State Zone</label>
                  <input name="state" placeholder="e.g., Punjab" value={form.state} onChange={handleChange} />
                </div>
                <div className="input-block">
                  <label>Total Land Area (Acres)</label>
                  <input name="acres" type="number" step="any" placeholder="e.g., 4.5" value={form.acres} onChange={handleChange} />
                </div>
                <div className="input-block">
                  <label>Net Yield Quantity (kg)</label>
                  <input name="quantity" type="number" placeholder="e.g., 9000" value={form.quantity} onChange={handleChange} />
                </div>
                <div className="input-block">
                  <label>Yield Per Acre (kg/Ac)</label>
                  <input name="yieldPerAcre" type="number" placeholder="Calculated automatically if empty" value={form.yieldPerAcre} onChange={handleChange} />
                </div>
                <div className="input-block">
                  <label>Harvest Dynamic Date</label>
                  <input name="harvestDate" type="date" value={form.harvestDate} onChange={handleChange} />
                </div>
                <div className="input-block">
                  <label>Target Season</label>
                  <input name="season" placeholder="e.g., Kharif 2026" value={form.season} onChange={handleChange} />
                </div>
                <div className="input-block">
                  <label>Target Valuation Base (₹/kg)</label>
                  <input name="expectedPriceKg" type="number" step="any" placeholder="e.g., 65" value={form.expectedPriceKg} onChange={handleChange} />
                </div>
              </div>
              
              <div className="input-block full-width">
                <label>System Metadata / Operational Notes</label>
                <textarea name="notes" rows="2" placeholder="Record soil metrics, weather abnormalities or specific storage batch identifiers..." value={form.notes} onChange={handleChange} />
              </div>

              <div className="input-block checkbox-wrapper-modern">
                <label className="switch-container">
                  <input type="checkbox" name="isMarketplaceListed" checked={form.isMarketplaceListed} onChange={handleChange} />
                  <span className="custom-slider"></span>
                </label>
                <div className="checkbox-labels">
                  <strong>List Automatically to Open Farm Marketplace</strong>
                  <span>Broadcast allocation values to vendor brokers and digital logistics buyers instantly.</span>
                </div>
              </div>

              <div className="modal-actions-modern">
                <button type="button" className="btn-secondary-modern" onClick={closeAdd}>Cancel Configuration</button>
                <button type="submit" className="btn-submit-modern">Commit Asset to Ledger</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HarvestList;