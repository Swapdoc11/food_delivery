import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        minlength: [2, "Product name must be at least 2 characters"],
        maxlength: [100, "Product name must be less than 100 characters"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        minlength: [5, "Description must be at least 5 characters"],
        maxlength: [1000, "Description must be less than 1000 characters"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be a positive number"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true,
        minlength: [2, "Category must be at least 2 characters"],
        maxlength: [50, "Category must be less than 50 characters"],
    },
    image: {
        type: String,
        required: [true, "Image is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // Add more fields and validations as needed
});

// Prevent OverwriteModelError
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;