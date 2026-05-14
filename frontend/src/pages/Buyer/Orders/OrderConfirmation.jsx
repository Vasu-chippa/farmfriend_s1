import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../../../api';
import './OrderConfirmation.css';
import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // If we navigated here with the order in location.state, use that first
        if (location.state && location.state.order) {
          setOrder(location.state.order);
          return;
        }

        const res = await API.get(`/buyers/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Error fetching order:', err);
      }
    };
    fetchOrder();
  }, [orderId, location.state]);

  if (!order) return <div className="oc-loading">Loading confirmation…</div>;

  return (
    <motion.div className="oc-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="oc-card oc-center-card">
        <div className="oc-success">
          <div className="oc-check">✓</div>
          <h2>Order Confirmed!</h2>
          <p className="oc-sub">Thanks for your purchase — your order is confirmed.</p>
          {location.state && location.state.demo && (
            <p className="oc-demo">Note: This was a demo payment (not persisted).</p>
          )}
        </div>

        <div className="oc-details">
          <div className="oc-detail">
            <div className="oc-detail-label">Order ID</div>
            <div className="oc-detail-value">{order._id}</div>
          </div>
          <div className="oc-detail">
            <div className="oc-detail-label">Transaction ID</div>
            <div className="oc-detail-value">{order.payment?.transactionId || '—'}</div>
          </div>
        </div>

        <div className="oc-summary">
          <h3>Order Summary</h3>
          <div className="oc-detail">
            <div className="oc-detail-label">Item</div>
            <div className="oc-detail-value">{order.product?.name || 'Item'} <span className="oc-qty">x{order.quantity}</span></div>
          </div>
          <div className="oc-detail">
            <div className="oc-detail-label">Total</div>
            <div className="oc-detail-value">₹{order.total}</div>
          </div>
        </div>

        <div className="oc-actions">
          <button className="btn primary" onClick={() => navigate('/buyer/orders')}>Track Your Order</button>
          <button className="btn ghost" onClick={() => navigate('/buyer/marketplace')}>Continue Shopping</button>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderConfirmation;
