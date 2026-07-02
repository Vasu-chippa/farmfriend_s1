import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../../api";
import { motion } from "framer-motion";
import { FaRupeeSign, FaBoxOpen, FaStar, FaLeaf } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { getCropImageFromSrc, getCropImageByName } from '../../../utils/imageMap';
// toast is not used here
import "./CropDetails.css";

function Img({ src, alt, className }) {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      initial={{ opacity: 0.94, scale: 0.995 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.36 }}
    />
  );
}

function resolveImageSrc(s) {
  if (!s) return getCropImageByName('default');
  if (s.startsWith('http')) return s;
  return getCropImageFromSrc(s);
}

function ImageCarousel({ images, name }) {
  const [index, setIndex] = useState(0);
  const len = images.length;
  const autoRef = useRef(null);

  const next = () => setIndex((i) => (i + 1) % len);
  const prev = () => setIndex((i) => (i - 1 + len) % len);

  useEffect(() => {
    if (len <= 1) return;
    autoRef.current = setInterval(() => setIndex((i) => (i + 1) % len), 4000);
    return () => clearInterval(autoRef.current);
  }, [len]);

  return (
    <div className="carousel">
      <div className="carousel-window">
        <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {images.map((img, i) => (
            <div className="carousel-slide" key={i}>
              <Img src={resolveImageSrc(img)} alt={`${name} - ${i + 1}`} className="crop-main-img" />
            </div>
          ))}
        </div>
      </div>

      {len > 1 && (
        <>
          <button className="carousel-nav prev" onClick={prev} aria-label="Previous image">
            <IoChevronBack />
          </button>
          <button className="carousel-nav next" onClick={next} aria-label="Next image">
            <IoChevronForward />
          </button>

          <div className="carousel-thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                className={`thumb ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}`}
              >
                <img src={resolveImageSrc(img)} alt={`thumb-${i}`} onError={(e)=>e.target && (e.target.src=`/cropimages/default.jpeg`)} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CropDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        const res = await API.get(`/crops/${id}`);
        setCrop(res.data);
      } catch (err) {
        try {
          const token = localStorage.getItem("token");
          const res = await API.get(`/farmers/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCrop(res.data);
        } catch (err2) {
          console.error("Error fetching crop/product:", err2);
          setCrop(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCrop();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!crop) return <p>❌ Crop not found</p>;

  return (
    <div className="main-content">
      <motion.div
        className="crop-details-container"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="crop-details-card">
          <div className="crop-grid">

            {/* IMAGE / CAROUSEL */}
            <div className="crop-media">
              {crop.images && crop.images.length > 0 ? (
                <ImageCarousel images={crop.images} name={crop.name} />
              ) : (
                <div className="crop-main-img crop-placeholder">No image</div>
              )}
            </div>

            {/* DETAILS */}
            <div className="crop-details">
              <h2 className="crop-title">{crop.name}</h2>
              <p className="crop-desc">{crop.description || "No description provided"}</p>

              <div className="crop-info">
                <div className="info-card">
                  <span className="icon-circle"><FaRupeeSign /></span>
                  <div>
                    <p>Price</p>
                    <h4>₹{crop.price} / kg</h4>
                  </div>
                </div>

                <div className="info-card">
                  <span className="icon-circle"><FaBoxOpen /></span>
                  <div>
                    <p>Available</p>
                    <h4>{crop.quantity} kg</h4>
                  </div>
                </div>

                <div className="info-card">
                  <span className="icon-circle"><FaStar /></span>
                  <div>
                    <p>Quality</p>
                    <h4>{crop.quality || "N/A"}</h4>
                  </div>
                </div>

                <div className="info-card">
                  <span className="icon-circle"><FaLeaf /></span>
                  <div>
                    <p>Organic</p>
                    <h4>{crop.organic ? <span className="organic">Yes</span> : <span className="non-organic">No</span>}</h4>
                  </div>
                </div>
              </div>

              {/* CTAs removed per request */}

            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
