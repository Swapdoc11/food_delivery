import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    image: String,
    // Add other fields as needed
});

// Prevent OverwriteModelError
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;