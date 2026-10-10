import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { FiMenu, FiChevronLeft, FiHome, FiShoppingCart, FiUser, FiBarChart2, FiMoon, FiUsers, FiLogOut, FiClipboard } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAuth } from '../../utils/auth';

const defaultItems = [
  { to: '/', icon: <FiHome />, label: 'Home' },
];

const Sidebar = ({ items: itemsProp }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const onChange = () => setOpen(!mql.matches);
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  // publish CSS variable so layout can adapt when sidebar toggles
  useEffect(() => {
    const setVar = (w) => document.documentElement.style.setProperty('--sidebar-width', w);
    // initial
    setVar(open ? '300px' : '92px');
    return () => {
      // keep var but no cleanup necessary
    };
  }, [open]);

  // read user from localStorage if available
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : { fullName: 'Guest', role: 'Farmer' };
  const initial = (user.fullName || 'G').charAt(0).toUpperCase();

  // role-specific menu
  const roleMap = {
    farmer: [
      { to: '/farmer/dashboard', icon: <FiHome />, label: 'Dashboard' },
      { to: '/farmer/crops', icon: <GiWheat />, label: 'Crops' },
      { to: '/farmer/marketplace', icon: <FiShoppingCart />, label: 'Marketplace' },
      { to: '/farmer/harvest', icon: <FiBarChart2 />, label: 'Harvest' },
      { to: '/farmer/expenses', icon: <FiClipboard />, label: 'Expense Tracker' },
      { to: '/farmer/profile', icon: <FiUser />, label: 'Profile' },
    ],
    buyer: [
      { to: '/buyer/dashboard', icon: <FiHome />, label: 'Dashboard' },
      { to: '/buyer/marketplace', icon: <FiShoppingCart />, label: 'Marketplace' },
      { to: '/buyer/orders', icon: <FiBarChart2 />, label: 'Orders' },
      { to: '/buyer/profile', icon: <FiUser />, label: 'Profile' },
    ],
    agent: [
      { to: '/agent/dashboard', icon: <FiHome />, label: 'Dashboard' },
      { to: '/agent/farmers', icon: <FiUsers />, label: 'Farmers' },
      { to: '/agent/orders', icon: <FiBarChart2 />, label: 'Orders' },
      { to: '/agent/profile', icon: <FiUser />, label: 'Profile' },
    ],
    admin: [
      { to: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
    ],
  };

  // normalize role (some user objects store 'Farmer' capitalized)
  const roleKey = (user.role || '').toString().toLowerCase();
  const navItems = Array.isArray(itemsProp) && itemsProp.length ? itemsProp : (roleMap[roleKey] || defaultItems);

  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    try { document.documentElement.style.removeProperty('--sidebar-width'); } catch (e) {}
    navigate('/');
    // reload to reset any protected-route state (optional)
    // window.location.reload();
  };

  const sidebarVariants = {
    hidden: { x: -30, opacity: 0, y: -6 },
    visible: { x: 0, opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -8, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.28 } },
  };

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className={`${styles.sidebar} ${open ? styles.open : ''}`}
      style={{ backgroundColor: 'blue' }}
    >
      <div className={styles.floatingCard}>
        <div className={styles.headerRow}>
          <button aria-label="Toggle sidebar" className={styles.toggle} onClick={() => setOpen(s => !s)}>
            {open ? <FiChevronLeft /> : <FiMenu />}
          </button>
          {open && <div className={styles.brand}>FarmFriend</div>}
          <div style={{ marginLeft: 'auto' }}>
            <button
              className={styles.themeBtn}
              onClick={() => {
                const next = document.documentElement.classList.toggle('dark');
                localStorage.setItem('ff-dark', next ? '1' : '0');
              }}
              title="Toggle dark"
            >
              <FiMoon />
            </button>
          </div>
        </div>

        <div className={styles.profile}>
          <div className={styles.avatar} aria-hidden>
            {initial}
            <span className={styles.avatarGlow} />
          </div>
          {open && (
            <div className={styles.profileInfo}>
              <div className={styles.name}>{user.fullName}</div>
              <div className={styles.role}>{user.role || 'Farmer'}</div>
            </div>
          )}
        </div>

        <motion.nav className={styles.nav} initial="hidden" animate="visible" variants={listVariants}>
          {navItems.map((it) => (
            <motion.div key={it.to} variants={itemVariants}>
              <NavLink
                to={it.to}
                className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.icon}>{it.icon}</div>
                {open && <div className={styles.label}>{it.label}</div>}
              </NavLink>
            </motion.div>
          ))}
        </motion.nav>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.footer}>
              <small className={styles.muted}>v1.0 • © FarmFriend</small>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.sidebarFooterActions}>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <div className={styles.icon}><FiLogOut /></div>
            {open && <div className={styles.label}>Logout</div>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
