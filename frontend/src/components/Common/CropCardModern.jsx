import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiDollarSign, FiPlus } from 'react-icons/fi';
import { FiBox, FiStar } from 'react-icons/fi';
import API from '../../api';
import './CropCardModern.css';
import { toast } from 'react-toastify';

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.03, boxShadow: '0 18px 40px rgba(14, 60, 20, 0.08)' }
};

function addToHarvestLocal(item) {
  const raw = localStorage.getItem('harvestList');
  const list = raw ? JSON.parse(raw) : [];
  const exists = list.find((i) => i._id === item._id);
  if (exists) return { ok: false, exists: true };
  list.push(item);
  localStorage.setItem('harvestList', JSON.stringify(list));
  return { ok: true };
}

const CropCardModern = ({ crop }) => {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const checkAdded = useCallback(() => {
    try {
      const raw = localStorage.getItem('harvestList');
      const list = raw ? JSON.parse(raw) : [];
      return list.some((i) => i._id === (crop._id || crop.id));
    } catch (e) {
      return false;
    }
  }, [crop]);

  const handleCardClick = () => {
    const id = crop._id || crop.id;
    if (!id) return;
    navigate(`/farmer/crops/${id}`);
  };

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    const item = {
      _id: crop._id || crop.id,
      name: crop.name,
      price: crop.price || 0,
      quantity: crop.quantity || 0,
      addedAt: new Date().toISOString(),
    };
    // If user is authenticated, try backend add first
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await API.post('/harvest', { cropId: item._id, name: item.name, price: item.price, quantity: item.quantity }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Added to Harvest 🌾');
        setIsAdded(true);
        window.dispatchEvent(new Event('harvestUpdated'));
        setTimeout(() => { navigate('/farmer/harvest'); }, 700);
        setAdding(false);
        return;
      } catch (err) {
        console.warn('Backend add failed, falling back to local storage', err);
        // fallback to localStorage below
      }
    }

    const res = addToHarvestLocal(item);
    if (!res.ok && res.exists) {
      toast.info('Already added');
      setIsAdded(true);
      window.dispatchEvent(new Event('harvestUpdated'));
      setAdding(false);
      return;
    }

    toast.success('Added to Harvest 🌾');
    setIsAdded(true);
    window.dispatchEvent(new Event('harvestUpdated'));
    setTimeout(() => { navigate('/farmer/harvest'); }, 900);
    setAdding(false);
  };

  const imageSrc = crop.images && crop.images.length > 0
    ? (crop.images[0].startsWith('http') ? crop.images[0] : `http://localhost:5000${crop.images[0]}`)
    : (crop.image ? `${process.env.PUBLIC_URL}/cropimages/${encodeURIComponent(crop.image)}` : `${process.env.PUBLIC_URL}/cropimages/default.jpeg`);

  useEffect(() => {
    setIsAdded(checkAdded());
    const handler = () => setIsAdded(checkAdded());
    window.addEventListener('harvestUpdated', handler);
    const storageHandler = (e) => { if (e.key === 'harvestList') setIsAdded(checkAdded()); };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('harvestUpdated', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, [crop, checkAdded]);

  return (
    <motion.article className="ccm-card" variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" onClick={handleCardClick} role="button" tabIndex={0} onKeyDown={(e)=> { if (e.key==='Enter') handleCardClick(); }}>
      <div className="ccm-image-wrap">
        <img src={imageSrc} alt={crop.name} className="ccm-image" />
      </div>

      <div className="ccm-body">
        <div className="ccm-row">
          <div className="ccm-title">{crop.name}</div>
          <div className="ccm-price">₹{crop.price ?? '-'} <span className="ccm-unit">/ kg</span></div>
        </div>
        <div className="ccm-desc">{(crop.description || crop.short || '').slice(0,80)}</div>

        <div className="ccm-grid">
          <div className="ccm-info">
            <div className="ii-icon"><FiBox /></div>
            <div className="ii-label">Quantity</div>
            <div className="ii-value">{crop.quantity ?? 0} kg</div>
          </div>

          <div className="ccm-info">
            <div className="ii-icon"><FiStar /></div>
            <div className="ii-label">Quality</div>
            <div className="ii-value">{crop.quality || 'A Grade'}</div>
          </div>

          <div className="ccm-info">
            <div className="ii-icon"><FiClock /></div>
            <div className="ii-label">Est. Time</div>
            <div className="ii-value">{crop.time || crop.estimatedTime || '120 - 150 days'}</div>
          </div>

          <div className="ccm-info">
            <div className="ii-icon"><FiDollarSign /></div>
            <div className="ii-label">Est. Expense</div>
            <div className="ii-value">₹{crop.expense || crop.estimatedExpense || '8,500'} / acre</div>
          </div>
        </div>

        <motion.button
          className={`ccm-add ${adding ? 'adding' : ''} ${isAdded ? 'added' : ''}`}
          onClick={handleAdd}
          whileTap={{ scale: 0.95 }}
          aria-label="Add to harvest"
          disabled={isAdded}
        >
          {isAdded ? 'Added ✓' : (<><FiPlus className="btn-icon" /> + Add to Harvest</>)}
        </motion.button>
      </div>
    </motion.article>
  );
};



export default CropCardModern;
