import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    password: { type: String, required: true },
    refreshToken: { type: String },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
