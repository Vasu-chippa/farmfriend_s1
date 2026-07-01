import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api';
import './FarmerProfile.css';

export default function FarmerProfile() {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const raw = localStorage.getItem('user');
		if (raw) {
			try { setUser(JSON.parse(raw)); return; }
			catch (e) { console.error('Failed to parse user from storage', e); }
		}
		// Try fetching current user from server (cookie-based auth)
		(async () => {
			try {
				const res = await API.get('/auth/me');
				if (res && res.data && res.data.user) {
					setUser(res.data.user);
					try { localStorage.setItem('user', JSON.stringify(res.data.user)); } catch (e) {}
					return;
				}
			} catch (err) {
				// fallthrough to redirect
			}
			navigate('/farmer/login');
		})();
	}, [navigate]);

	if (!user) return null;

	return (
		<div className="ff-profile-root">
			<button className="back-btn" onClick={() => navigate(-1)}>←</button>
			<div className="ff-profile-left">
				
				<div className="ff-avatar">{(user.fullName || 'G').charAt(0).toUpperCase()}</div>
				<h3 className="ff-name">{user.fullName}</h3>
				<div className="ff-role">{user.role || 'Farmer'}</div>

				<nav className="ff-side-links">
					<button className="active" aria-current="page">Profile</button>
					<button onClick={() => navigate('/farmer/harvest')}>Tasks</button>
				</nav>
			</div>

			<div className="ff-profile-main">
				<div className="card">
					<h4>Overview</h4>
					<p className="muted">Summary of activity and contact</p>
					<div style={{ textAlign: 'right' }}>
						<button onClick={() => navigate('/farmer/profile/edit')} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}>Edit</button>
					</div>
					<div className="info-grid">
						<div className="info-item">
							<div className="info-icon">@</div>
							<div>
								<div className="info-label">Email</div>
								<div className="info-value">{user.email || '—'}</div>
							</div>
						</div>
						<div className="info-item">
							<div className="info-icon">📞</div>
							<div>
								<div className="info-label">Phone</div>
								<div className="info-value">{user.phone || '—'}</div>
							</div>
						</div>
						<div className="info-item">
							<div className="info-icon">📍</div>
							<div>
								<div className="info-label">Address</div>
								<div className="info-value">{user.address || user.location || '—'}</div>
							</div>
						</div>
						<div className="info-item">
							<div className="info-icon">🎂</div>
							<div>
								<div className="info-label">Age</div>
								<div className="info-value">{user.age || '—'}</div>
							</div>
						</div>
						<div className="info-item">
							<div className="info-icon">⚧</div>
							<div>
								<div className="info-label">Gender</div>
								<div className="info-value">{user.gender || '—'}</div>
							</div>
						</div>
						<div className="info-item">
							<div className="info-icon">🌾</div>
							<div>
								<div className="info-label">Acres</div>
								<div className="info-value">{user.acres || '—'}</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<aside className="ff-profile-right">
				<div className="card">
					<h4>Biography</h4>
					<p className="muted">{user.bio || 'No biography provided yet.'}</p>
				</div>
			</aside>
		</div>
	);
}
