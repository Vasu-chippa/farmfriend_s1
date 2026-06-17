// apps/frontend/src/pages/Farmer/Crops/FarmerCrops.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../../api';
import { getAuthHeaders } from '../../../utils/auth';
import { motion } from 'framer-motion';
import CropCardModern from '../../../components/Common/CropCardModern';
import './FarmerCropsModern.css';

const FarmerCrops = () => {
  const [crops, setCrops] = useState([]);
  // don't rely on token being stored client-side; prefer cookie-based auth
  // use getAuthHeaders() to avoid sending 'Bearer null'
  const navigate = useNavigate();
  const location = useLocation();

  const fetchedRef = useRef(false);
  const fetchCrops = useCallback(async (force = false) => {
    if (fetchedRef.current && !force) return crops;
    try {
      const res = await API.get('/crops', { headers: getAuthHeaders() });
      const data = res.data || [];
      console.debug('[FarmerCrops] fetched', data.length, 'crops');
      if (!data.length) {
        console.debug('[FarmerCrops] no crops returned from protected route, trying public endpoint');
        try {
          const pub = await API.get('/crops/public/all');
          const pData = pub.data || [];
          console.debug('[FarmerCrops] public fetched', pData.length, 'crops');
          setCrops(pData);
          fetchedRef.current = true;
          return pData;
        } catch (e) {
          console.error('[FarmerCrops] public fallback failed', e);
        }
      }

      setCrops(data);
      fetchedRef.current = true;
      return data;
    } catch (err) {
      // If auth error or empty, try public endpoint as fallback
      if (err && err.response && (err.response.status === 401 || err.response.status === 403)) {
        try {
          const pub = await API.get('/crops/public/all');
          const pData = pub.data || [];
          console.debug('[FarmerCrops] fallback public fetched', pData.length, 'crops');
          setCrops(pData);
          fetchedRef.current = true;
          return pData;
        } catch (e) {
          console.error('[FarmerCrops] public fallback after auth error failed', e);
        }
      }

      console.error('Error fetching crops', err);
      return [];
    }
  }, [token, crops]);

  useEffect(() => { fetchCrops(); }, [fetchCrops]);

  // Resolve ?crop=name to crop detail when possible
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('crop');
    if (!q) return;

    const tryResolve = async () => {
      const matchedLocal = crops.find((x) => x.name && x.name.toLowerCase() === q.toLowerCase());
      if (matchedLocal) {
        navigate(`/farmer/crops/${matchedLocal._id}`, { replace: true });
        return;
      }
      const fetched = await fetchCrops();
      const matched = (fetched || []).find((x) => x.name && x.name.toLowerCase() === q.toLowerCase());
      if (matched) navigate(`/farmer/crops/${matched._id}`, { replace: true });
    };

    tryResolve();
  }, [location.search, crops, fetchCrops, navigate]);

  return (
    <div className="farmer-crops">
      <h2>🌱 Farmer's Crop List</h2>

      {crops.length === 0 && (
        <div style={{ padding: '1rem 0' }}>
          <p style={{ margin: 0 }}>No crops found from the server.</p>
          <p style={{ margin: 0 }}>You can load local sample crops for UI testing.</p>
          <button
            type="button"
            onClick={() => {
              const samples = [
                { _id: 's1', name: 'Wheat', price: 1200, quantity: 150, image: 'wheat.jpeg', description: 'High yield wheat variety.' },
                { _id: 's2', name: 'Paddy', price: 900, quantity: 200, image: 'rice.jpeg', description: 'Paddy for humid regions.' },
                { _id: 's3', name: 'Mirchi', price: 3200, quantity: 50, image: 'mirchi.jpeg', description: 'Hot red mirchi.' },
              ];
              setCrops(samples);
              fetchedRef.current = true;
            }}
            style={{ marginTop: 8, padding: '8px 12px', background: 'linear-gradient(90deg,#16a34a,#7dd3fc)', color: '#fff', border: 'none', borderRadius: 8 }}
          >
            Load sample crops
          </button>
        </div>
      )}

      <section className="cards-section">
        <div className="cards-grid">
          {crops
            .filter((c) => {
              if (!c || !c.name) return true;
              const n = c.name.toLowerCase();
              // exclude sugarcane / sugar cane
              if (n.includes('sugar') || n.includes('sugarcane') || n.includes('sugar cane')) return false;
              return true;
            })
            .map((crop, idx) => (
              <motion.div key={crop._id || crop.id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}>
                <CropCardModern crop={crop} />
              </motion.div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default FarmerCrops;
