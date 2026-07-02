import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API, { getBackendImageUrl } from '../../../api';
import { toast } from 'react-toastify';
import { getCropImageByName, getCropImageFromSrc } from '../../../utils/imageMap';
import { FiArrowLeft, FiPlus, FiBox, FiStar, FiClock, FiDollarSign } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

// Tailwind-based Crop Details (premium, responsive)
// Usage: import and use in routes to replace the existing details page.

const sampleChart = (c) => {
  const base = (c?.price || 1000) / 10;
  const q = c?.quantity || 100;
  return [1,2,3,4,5,6].map((w) => ({ week: `W${w}`, profit: Math.round((base * w) + q * (w*0.1)), expense: Math.round((base * 0.6 * w) + q * (w*0.05)) }));
};

function addToHarvestLocal(item) {
  try {
    const raw = localStorage.getItem('harvestList');
    const list = raw ? JSON.parse(raw) : [];
    const exists = list.find((i) => i._id === item._id);
    if (exists) return { ok: false, exists: true };
    list.push(item);
    localStorage.setItem('harvestList', JSON.stringify(list));
    return { ok: true };
  } catch (err) { return { ok: false }; }
}

const StatCard = ({ icon, label, value, accentClass }) => (
  <div className={`flex items-center gap-4 p-3 rounded-2xl bg-white/60 backdrop-blur border border-white/40 shadow-md ${accentClass}`}>
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center text-2xl shadow-sm">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-lg font-semibold text-slate-900">{value}</span>
    </div>
  </div>
);

const ActionCard = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="group bg-white/50 backdrop-blur p-4 rounded-2xl border border-white/40 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition duration-200 flex flex-col items-start gap-2">
    <div className="text-2xl text-slate-800 group-hover:text-primary transition-colors">{icon}</div>
    <div className="text-sm font-semibold text-slate-900">{label}</div>
  </button>
);

const BadgeGridItem = ({ title, subtitle, colorFrom, colorTo, icon }) => (
  <div className={`rounded-2xl p-4 text-white shadow-lg transform transition hover:-translate-y-1`} style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}>
    <div className="flex items-start gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs opacity-90 mt-1">{subtitle}</div>
      </div>
    </div>
  </div>
);

const FarmerCropDetailsTW = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (location.state?.crop) { setCrop(location.state.crop); setLoading(false); return; }
    const fetchCrop = async () => {
      setLoading(true);
      try {
        let res;
        try { res = await API.get(`/crops/${id}`); } catch (e) { res = await API.get(`/crops/public/${id}`); }
        const data = res.data?.crop || res.data || null;
        setCrop(data);
      } catch (err) { console.error(err); toast.error('Failed to load crop'); }
      finally { setLoading(false); }
    };
    fetchCrop();
  }, [id, location.state]);

  const resolveImage = (c) => {
    if (!c) return getCropImageByName('default');
    if (c.images && c.images.length) return c.images[0].startsWith('http') ? c.images[0] : getBackendImageUrl(c.images[0]);
    return getCropImageFromSrc(c.image || c.name);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('harvestList');
      const list = raw ? JSON.parse(raw) : [];
      setAdded(list.some(i => i._id === (crop?._id || crop?.id)));
    } catch (e) {}
  }, [crop]);

  const handleAdd = () => {
    if (!crop) return;
    setAdding(true);
    const item = { _id: crop._id || crop.id, name: crop.name, price: crop.price, quantity: crop.quantity };
    const res = addToHarvestLocal(item);
    if (!res.ok) { toast.info('Already added'); setAdded(true); window.dispatchEvent(new Event('harvestUpdated')); setAdding(false); return; }
    toast.success('Added to Harvest');
    setAdded(true);
    window.dispatchEvent(new Event('harvestUpdated'));
    setAdding(false);
  };

  if (loading) return <div className="min-h-[320px] flex items-center justify-center">Loading...</div>;
  if (!crop) return <div className="min-h-[320px] flex items-center justify-center text-slate-600">Crop not found</div>;

  const chartData = sampleChart(crop);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transform hover:-translate-y-1 transition duration-200">
            <FiArrowLeft className="text-lg" />
            <span className="font-semibold text-slate-800">Back to Crops</span>
          </button>
        </div>

        {/* Top hero: image + details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img src={resolveImage(crop)} alt={crop.name} className="w-full h-64 object-cover" />
            </div>
            {/* badge grid under image (first crop card grid) */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-3">
              <BadgeGridItem title="Wheat - Bansi" subtitle="200 kg" colorFrom="#FFB6C1" colorTo="#FF7A7A" icon={<FiBox />} />
              <BadgeGridItem title="Paddy - IR64" subtitle="250 kg" colorFrom="#D6E4FF" colorTo="#9EC5FF" icon={<FiStar />} />
              <BadgeGridItem title="Maize - Sweet" subtitle="180 kg" colorFrom="#D1FAE5" colorTo="#86EFAC" icon={<FiClock />} />
              <BadgeGridItem title="Cotton - Bt" subtitle="120 kg" colorFrom="#FDE68A" colorTo="#F59E0B" icon={<FiDollarSign />} />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="bg-white/60 backdrop-blur rounded-2xl p-5 border border-white/30 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">{crop.name}</h1>
                  <p className="text-sm text-slate-600 mt-1">{crop.description || crop.short || 'High quality crop for local cultivation.'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Price</div>
                    <div className="text-lg font-bold">₹{crop.price ?? '-'}/kg</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard icon={<FiBox />} label="Quantity" value={`${crop.quantity ?? 0} kg`} />
                <StatCard icon={<FiStar />} label="Quality" value={crop.quality || 'A Grade'} />
                <StatCard icon={<FiClock />} label="Est. Time" value={crop.duration || '120 - 150 days'} />
              </div>
            </div>

            {/* Analytics + Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white/60 backdrop-blur rounded-2xl p-4 border border-white/30 shadow-md">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Analytics Overview</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
                      <defs>
                        <linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity={0.18}/><stop offset="100%" stopColor="#16a34a" stopOpacity={0}/></linearGradient>
                      </defs>
                      <XAxis dataKey="week" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <aside className="bg-white/60 backdrop-blur rounded-2xl p-4 border border-white/30 shadow-md">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Crop Information</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex justify-between"><span className="text-slate-700 font-medium">Type</span><span>{crop.type || 'Cereal'}</span></li>
                  <li className="flex justify-between"><span className="text-slate-700 font-medium">Sowing</span><span>{crop.season || 'Rabi'}</span></li>
                  <li className="flex justify-between"><span className="text-slate-700 font-medium">Duration</span><span>{crop.duration || '120 - 150 days'}</span></li>
                  <li className="flex justify-between"><span className="text-slate-700 font-medium">Yield</span><span>{crop.expectedYield || '25 - 30 Quintal/Acre'}</span></li>
                </ul>
              </aside>
            </div>

            {/* Quick actions as mini-cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ActionCard icon={<FiPlus />} label={added ? 'Added to Harvest' : 'Add to Harvest'} onClick={handleAdd} />
              <ActionCard icon={<FiBox />} label="View Inventory" onClick={() => navigate('/farmer/inventory')} />
              <ActionCard icon={<FiDollarSign />} label="Cost Estimator" onClick={() => navigate('/farmer/costs')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerCropDetailsTW;
