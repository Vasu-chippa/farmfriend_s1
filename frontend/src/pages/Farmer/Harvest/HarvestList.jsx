import React, { useEffect, useState } from "react";
import API from "../../../api";
import { getAuthHeaders } from "../../../utils/auth";
import { getRecords } from "../../../services/cropRecordService";
import { useNavigate, useLocation } from "react-router-dom";
import "./Harvest.css";

const HarvestList = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [highlighted, setHighlighted] = useState(null);
  const [acresMap, setAcresMap] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchHarvest = async () => {
      try {
        const token = localStorage.getItem("token");
        let list = [];
        try {
          const res = await API.get("/harvest", {
            headers: getAuthHeaders(),
          });
          list = res.data.crops || [];
        } catch (err) {
          // API may fail for unauthenticated users; we'll fall back to localStorage below
          console.warn('Could not fetch backend harvest, will check localStorage', err);
          list = [];
        }

        // Merge with any localStorage-based harvestList for unauthenticated / offline adds
        try {
          const raw = localStorage.getItem('harvestList');
          const local = raw ? JSON.parse(raw) : [];
          const mappedLocal = local.map(it => {
            // prefer stored image value if provided, but keep it normalized (relative path or URL)
            let img = it.image || `${(it.name || 'default') + '.jpeg'}`;
            // If user saved a full url to image, keep it; otherwise keep filename or path and let getImageUrl handle normalization
            return { cropId: { _id: it._id, name: it.name, price: it.price, quantity: it.quantity, image: img } };
          });
          // merge unique by id (backend wins if conflicts)
          const merged = [...list];
          mappedLocal.forEach(lm => {
            const exists = merged.some(r => r && r.cropId && (r.cropId._id === lm.cropId._id));
            if (!exists) merged.push(lm);
          });

          const mergedCrops = merged.filter((c) => c && c.cropId);
          setCrops(mergedCrops);
          // after setting crops, attempt to fetch latest record acres for items missing acres
          setTimeout(() => fetchAcresForCrops(mergedCrops), 50);
        } catch (err) {
            const listCrops = list.filter((c) => c && c.cropId);
            setCrops(listCrops);
            setTimeout(() => fetchAcresForCrops(listCrops), 50);
        }
      } catch (err) {
        console.error("❌ Error fetching harvest list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHarvest();
  }, []);

  // if redirected with ?added=<id>, highlight that card briefly
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const added = params.get("added");
    if (added) {
      const t = setTimeout(() => {
        setHighlighted(added);
        setTimeout(() => setHighlighted(null), 2200);
        const el = document.querySelector(`[data-crop-id='${added}']`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [location.search]);

  const handleRemove = async (cropId) => {
    try {
      setRemoving(cropId);
      await API.delete(`/harvest/${cropId}`, {
        headers: getAuthHeaders(),
      });

      setCrops((prev) => prev.filter((c) => c && c.cropId && c.cropId._id !== cropId));
    } catch (err) {
      console.error("❌ Error removing crop:", err);
    } finally {
      setRemoving(null);
    }
  };

  const fetchAcresForCrops = async (cropEntries) => {
    if (!cropEntries || !cropEntries.length) return;
    const map = {};
    await Promise.all(cropEntries.map(async (entry) => {
      try {
        const cid = (entry.cropId && (entry.cropId._id || entry.cropId.id));
        if (!cid) return;
        // If crop entry already has acres field, prefer it
        if (entry.cropId.acres !== undefined && entry.cropId.acres !== null) {
          map[cid] = entry.cropId.acres;
          return;
        }
        const recs = await getRecords(cid);
        if (Array.isArray(recs) && recs.length > 0) {
          const latest = recs[0];
          if (latest && latest.acres !== undefined) map[cid] = latest.acres;
        }
      } catch (err) {
        // ignore per-crop errors
      }
    }));
    setAcresMap((prev) => ({ ...prev, ...map }));
  };

  if (loading) return <p>Loading harvest list...</p>;
  if (!crops.length) return <p>No crops added to your harvest list yet.</p>;

  

  const resolveCardImage = (cropObj) => {
    if (!cropObj) return `${process.env.PUBLIC_URL}/cropimages/default.jpeg`;
    // prefer images array like CropCardModern
    if (Array.isArray(cropObj.images) && cropObj.images.length > 0) {
      const first = cropObj.images[0];
      if (typeof first === 'string') {
        if (first.startsWith('http')) return first;
        // server-hosted path (e.g. /uploads/...), mirror CropCardModern prefix
        return first.startsWith('/') ? `http://localhost:5000${first}` : `http://localhost:5000/${first}`;
      }
    }

    // fallback to single image field
    if (cropObj.image && typeof cropObj.image === 'string') {
      // if it's a full url
      if (/^https?:\/\//i.test(cropObj.image)) return cropObj.image;
      // If the stored image is clearly a default/logo or contains extra descriptors, prefer inference by name
      if (/default|logo/i.test(cropObj.image) || /\s|-|%20|\(/.test(cropObj.image)) {
        // let caller infer from name
        return null;
      }
      // otherwise return the static public cropimages path
      return `${process.env.PUBLIC_URL}/cropimages/${encodeURIComponent(cropObj.image)}`;
    }

    // nothing explicit, return null so caller can infer from name
    return null;
  };

  const inferImageFromName = (name) => {
    if (!name) return `${process.env.PUBLIC_URL}/cropimages/default.jpeg`;
    // normalize name: remove descriptors like ' - Sweet', '(IR64)', etc.
    let n = name.toLowerCase();
    n = n.replace(/\s*-\s*.*/g, ''); // remove anything after ' - '
    n = n.replace(/\(.*\)/g, ''); // remove parenthetical descriptors
    n = n.replace(/[^a-z0-9 ]/g, ' '); // remove punctuation
    n = n.replace(/\s+/g, ' ').trim();
    const mapping = {
      // common names and aliases mapped to actual filenames in public/cropimages
      paddy: 'rice.jpeg',
      rice: 'rice.jpeg',
      wheat: 'wheat.jpeg',
      mirchi: 'mirchi.jpeg',
      chilli: 'mirchi.jpeg',
      'sugarcane': 'sugar  cane.jpeg',
      'sugar cane': 'sugar  cane.jpeg',
      sugar: 'sugar  cane.jpeg',
      maize: 'maize.jpeg',
      corn: 'maize.jpeg',
      cotton: 'cotton.jpeg',
      sesame: 'Sesame.jpeg',
      sesameseed: 'Sesame.jpeg',
      sunflower: 'sunflower.jpeg',
      barley: 'barley.jpeg',
      potato: 'potato.jpeg',
      potatoe: 'potato.jpeg',
      tomato: 'tomato.jpeg',
      turmeric: 'turmeric.jpeg',
      haldi: 'turmeric.jpeg',
      onion: 'onion.jpeg',
      castor: 'Castor.jpeg',
      groundnut: 'groundnut.jpeg',
      peanut: 'groundnut.jpeg',
      beans: 'beans.jpeg',
      bean: 'beans.jpeg',
      mirch: 'mirchi.jpeg'
    };

    for (const key of Object.keys(mapping)) {
      if (n.includes(key)) return `${process.env.PUBLIC_URL}/cropimages/${encodeURIComponent(mapping[key])}`;
    }
    return `${process.env.PUBLIC_URL}/cropimages/default.jpeg`;
  };


  return (
    <div className="harvest-container">
      <h2>🌾 My Harvest List</h2>
      <div className="harvest-grid">
        {crops.map((crop, idx) => {
          if (!crop || !crop.cropId) return null;

          return (
            <div
              key={crop.cropId._id || idx}
              className={`harvest-card ${highlighted === (crop.cropId._id) ? 'highlighted' : ''}`}
              data-crop-id={crop.cropId._id}
            >
              {/* Use same image logic as CropCardModern: images[] -> image -> inferFromName */}
              <img
                src={resolveCardImage(crop.cropId) || inferImageFromName(crop.cropId.name)}
                alt={crop.cropId.name || "crop"}
                className="harvest-image"
                onClick={() => navigate(`/farmer/harvest/${crop.cropId._id}`)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${process.env.PUBLIC_URL}/cropimages/default.jpeg`;
                }}
              />
              <div className="harvest-details">
                <h3>{crop.cropId.name}</h3>
                <p><b>Category:</b> {crop.cropId.category || "General"}</p>
                <p><b>Quality:</b> {crop.cropId.quality || "Standard"}</p>
                <p><b>Price:</b> ₹{crop.cropId.price}/kg</p>
                <p><b>Acres:</b> {acresMap[crop.cropId._id] ?? crop.cropId.acres ?? '-'} </p>
              </div>

              <div className="harvest-actions">
                <button
                  className="sell-btn"
                  onClick={() => navigate(`/farmer/marketplace?prefill=${encodeURIComponent(JSON.stringify({
                    name: crop.cropId.name,
                    price: crop.cropId.price,
                    quantity: crop.cropId.quantity
                  }))}`)}
                >
                  💰 Sell Now
                </button>

                <button
                  className="remove-btn"
                  onClick={() => handleRemove(crop.cropId._id)}
                  disabled={removing === crop.cropId._id}
                >
                  {removing === crop.cropId._id ? "Removing..." : "❌ Remove"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HarvestList;
