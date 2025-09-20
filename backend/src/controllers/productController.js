// backend/controllers/productController.js
import Product from "../models/Product.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("farmer", "name email");
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching marketplace products" });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "farmer",
      "name email"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};
