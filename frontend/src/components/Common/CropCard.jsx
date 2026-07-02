import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './CropCard.css';

const CropCard = ({ crop, onClick, onAdd, disabledAdd, highlight }) => {
  const imgSrc = crop.image
    ? (crop.image.startsWith('http') ? crop.image : `/cropimages/${encodeURIComponent(crop.image)}`)
    : `/cropimages/${encodeURIComponent((crop.name||'default').toLowerCase() + '.jpeg')}`;

  const status = crop.status || (crop.quantity > 0 ? 'Ready' : 'Growing');

  return (
    <motion.div
      className={`cf-crop-card ${highlight ? 'highlight' : ''}`}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 200 }}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick && onClick(); } }}
    >
      <div className="cf-img-wrap">
        <img src={imgSrc} alt={crop.name} onError={(e)=> e.target.src = `/cropimages/default.jpeg`} />
      </div>
      <div className="cf-body">
        <h4 className="cf-name">{crop.name}</h4>
        <div className="cf-meta">
          <span className="cf-price">₹{crop.price ?? '-'}</span>
          <span className="cf-qty">{crop.quantity ?? 0} kg</span>
        </div>
        <div className="cf-bottom">
          <span className={`cf-status ${status.toLowerCase()}`}>{status}</span>
          <span className="cf-stat">{crop.daysToIrrigate ? `${crop.daysToIrrigate}d water` : (crop.irrigation || '—')}</span>
        </div>
        <div className="cf-actions">
          <Link to={`/farmer/crops/${crop._id || crop.id}`} className="cf-view-link" onClick={(e)=>e.stopPropagation()}>View</Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CropCard;
