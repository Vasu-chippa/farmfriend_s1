// src/context/HarvestContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import API from "../api";

export const HarvestContext = createContext();

export const HarvestProvider = ({ children }) => {
  const [harvest, setHarvest] = useState([]);
  const token = localStorage.getItem("token");

  // fetch harvest list
  const fetchHarvest = useCallback(async () => {
    try {
      const res = await API.get("/harvest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHarvest(res.data.crops || []);
    } catch (err) {
      console.error("❌ Error fetching harvest:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchHarvest();
  }, [fetchHarvest]);

  // check if crop in harvest
  const isInHarvest = (id) => harvest.some((c) => c.cropId === id);

  // toggle crop in harvest
  const toggleHarvest = async (crop) => {
    try {
      if (isInHarvest(crop._id)) {
        const harvestItem = harvest.find((h) => h.cropId === crop._id);
        if (!harvestItem) return;
        await API.delete(`/harvest/${harvestItem._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHarvest((prev) => prev.filter((h) => h.cropId !== crop._id));
      } else {
        const res = await API.post("/harvest", { cropId: crop._id, crop: crop.name, status: "In Cart" }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHarvest((prev) => [...prev, res.data.harvest]);
      }
    } catch (err) {
      console.error("❌ Error toggling harvest:", err);
    }
  };

  return (
    <HarvestContext.Provider value={{ harvest, toggleHarvest, isInHarvest, fetchHarvest }}>
      {children}
    </HarvestContext.Provider>
  );
};
