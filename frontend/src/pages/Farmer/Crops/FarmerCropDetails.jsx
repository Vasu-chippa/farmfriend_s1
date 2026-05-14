import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../../../api';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import InfoCard from '../../../components/Common/InfoCard';
import StatBox from '../../../components/Common/StatBox';

import './CropDetailsView.css';

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0 },
};

const FarmerCropDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  // growthPct and statusLabel were unused; remove to satisfy linter

  useEffect(() => {
    if (location.state?.crop) {
      setCrop(location.state.crop);
      setLoading(false);
      return;
    }

    const fetchCrop = async () => {
      setLoading(true);
      try {
        // try protected route first
        let res;
        try {
          res = await API.get(`/crops/${id}`);
        } catch (err) {
          // fallback to public route
          res = await API.get(`/crops/public/${id}`);
        }

        const data = res.data?.crop || res.data || null;
        setCrop(data);
      } catch (err) {
        console.error('Fetch crop failed', err);
        toast.error('Failed to load crop');
      } finally {
        setLoading(false);
      }
    };

    fetchCrop();
  }, [id, location.state]);

  const resolveImage = (c) => {
    if (!c) return `${process.env.PUBLIC_URL}/cropimages/default.jpeg`;
    if (c.images && c.images.length) return c.images[0].startsWith('http') ? c.images[0] : `http://localhost:5000${c.images[0]}`;
    const map = { paddy: 'rice.jpeg', 'sugarcane': 'sugar cane.jpeg', mirchi: 'mirchi.jpeg' };
    const fname = map[(c.name || '').toLowerCase()] || `${(c.image || '').trim() || (c.name || '').toLowerCase() + '.jpeg'}`;
    return `${process.env.PUBLIC_URL}/cropimages/${encodeURIComponent(fname)}`;
  };

  const sampleChart = (c) => {
    // generate 6-week sample data using price/quantity
    const base = (c?.price || 1000) / 10;
    const q = c?.quantity || 100;
    return [1,2,3,4,5,6].map((w) => ({
      week: `W${w}`,
      profit: Math.round((base * w) + q * (w*0.1)),
      expense: Math.round((base * 0.6 * w) + q * (w*0.05)),
    }));
  };

  // Removed Count component (unused) to satisfy linter

  const addToHarvestLocal = (item) => {
    const raw = localStorage.getItem('harvestList');
    const list = raw ? JSON.parse(raw) : [];
    if (list.find(x => x._id === item._id)) return { ok: false };
    list.push(item);
    localStorage.setItem('harvestList', JSON.stringify(list));
    return { ok: true };
  };

  const handleAdd = async () => {
    if (!crop) return;
    setAdding(true);
    try {
      const item = { _id: crop._id || crop.id, name: crop.name, price: crop.price, quantity: crop.quantity };
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await API.post('/harvest', { cropId: item._id, name: item.name, price: item.price, quantity: item.quantity }, { headers: { Authorization: `Bearer ${token}` } });
          toast.success('Added to Harvest 🌾');
          setAdded(true);
          window.dispatchEvent(new Event('harvestUpdated'));
          // success animation
        } catch (err) {
          console.warn('Backend add failed, falling back to local storage', err);
          const res = addToHarvestLocal(item);
          if (!res.ok) { toast.info('Already in harvest'); setAdded(true); window.dispatchEvent(new Event('harvestUpdated')); return; }
          toast.success('Added to Harvest 🌾');
          setAdded(true);
          window.dispatchEvent(new Event('harvestUpdated'));
        }
      } else {
        const res = addToHarvestLocal(item);
        if (!res.ok) { toast.info('Already in harvest'); setAdded(true); window.dispatchEvent(new Event('harvestUpdated')); return; }
        toast.success('Added to Harvest 🌾');
        setAdded(true);
        window.dispatchEvent(new Event('harvestUpdated'));
      }
      // small pulse
      const el = document.querySelector('.btn-add');
      if (el) el.classList.add('pulse');
      setTimeout(() => { if (el) el.classList.remove('pulse'); }, 900);
    } catch (err) {
      console.error(err);
      toast.error('Could not add to harvest');
    } finally { setAdding(false); }
  };

  if (loading) return <div className="cd-loading">Loading crop...</div>;
  if (!crop) return <div className="cd-empty">Crop not found</div>;

  const chartData = sampleChart(crop);

  return (
    <motion.div className="crop-details-root" initial="hidden" animate="enter" variants={pageVariants}>
      <div className="cd-container">
        <button className="cd-back" onClick={() => navigate(-1)}>← Back to Crops</button>

        <motion.article className="cd-hero" whileHover={{ scale: 1.01 }}>
          <div className="cd-hero-left">
            <div className="cd-image-wrap">
              <img className="cd-image" src={resolveImage(crop)} alt={crop.name} />
            </div>
          </div>

          <div className="cd-hero-right">
            <h1 className="cd-title">{crop.name}</h1>
            <p className="cd-desc">{crop.description || crop.short || 'Best suitable for local cultivation. High quality crop.'}</p>

            <div className="cd-stat-row">
              <StatBox label="Price" value={`₹${crop.price ?? '-'}/kg`} />
              <StatBox label="Quantity" value={`${crop.quantity ?? 0} kg`} />
              <StatBox label="Quality" value={crop.quality || 'N/A'} />
            </div>
            
            <div className="cd-smart-inline">
              <div className="cd-smart-grid">
                <InfoCard title="Irrigation" value={crop.irrigationDays || '7'}>Days</InfoCard>
                <InfoCard title="Yield" value={crop.expectedYield || '25'}>Quintal/Acre</InfoCard>
                <InfoCard title="Investment" value={crop.investment ? `₹${crop.investment}` : '₹8000'}>/Acre</InfoCard>
              </div>
            </div>
          </div>
        </motion.article>
 
        <section className="cd-middle">
          <motion.div className="cd-analytics card" initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{staggerChildren:0.05}}>
            <h4>Analytics Overview</h4>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.aside className="cd-info card" initial={{opacity:0, y:8}} animate={{opacity:1,y:0}}>
            <h4>Crop Information</h4>
            <ul className="cd-info-list">
              <li><strong>Crop Type:</strong> {crop.type || 'Cereal'}</li>
              <li><strong>Sowing Season:</strong> {crop.season || 'Rabi'}</li>
              <li><strong>Growth Duration:</strong> {crop.duration || '120 - 150 days'}</li>
              <li><strong>Expected Yield:</strong> {crop.expectedYield || '25 - 30 Quintal/Acre'}</li>
              <li><strong>Soil Type:</strong> {crop.soil || 'Loamy, Clay'}</li>
              <li><strong>pH Level:</strong> {crop.ph || '6.0 - 7.5'}</li>
              <li><strong>Temperature:</strong> {crop.temperature || '15°C - 25°C'}</li>
              <li><strong>Humidity:</strong> {crop.humidity || '60% - 70%'}</li>
            </ul>
          </motion.aside>
        </section>

        <section className="cd-bottom">
          <motion.div className="card tips" whileHover={{ y: -4 }}>
            <h5>Farming Tips</h5>
            <ul className="tips-list">
              <li>Use high quality seeds for better yield.</li>
              <li>Ensure proper irrigation at critical growth stages.</li>
              <li>Apply balanced fertilizers for healthy growth.</li>
              <li>Control weeds and pests regularly.</li>
              <li>Harvest on time for maximum productivity.</li>
            </ul>
          </motion.div>

          <motion.div className="card recent" whileHover={{ y: -4 }}>
            <h5>Recent Activities</h5>
            <ul className="recent-list">
              <li><span className="ra-dot"/> Crop added <small>2 days ago</small></li>
              <li><span className="ra-dot"/> Irrigation scheduled <small>5 days ago</small></li>
              <li><span className="ra-dot"/> Fertilizer applied <small>12 days ago</small></li>
              <li><span className="ra-dot"/> Pest control done <small>18 days ago</small></li>
            </ul>
          </motion.div>

          <motion.div className="card actions" whileHover={{ y: -4 }}>
            <h5>Quick Actions</h5>
            <motion.button className={`btn-add ${added ? 'added' : ''}`} onClick={handleAdd} whileTap={{ scale: 0.97 }} animate={added ? { scale: [1, 1.03, 1] } : {}}>
              {added ? 'Added ✓' : (adding ? 'Adding...' : '+ Add to Harvest')}
            </motion.button>

            <button className="btn-outline" onClick={() => navigate('/farmer/harvest')}>Go to Harvest</button>
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
};

export default FarmerCropDetails;