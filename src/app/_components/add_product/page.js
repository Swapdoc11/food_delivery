"use client";
import React, { useState } from "react";
import { API_BASE_URL } from "@/utils/api";

export default function AddProductForm() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    // Add this function to upload image to Cloudinary
    async function uploadToCloudinary(file) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "foodie"); // set in your Cloudinary dashboard

        const res = await fetch("https://api.cloudinary.com/v1_1/dijkpvobx/image/upload", {
            method: "POST",
            body: data,
        });
        const json = await res.json();
        console.log(json);
        
        return json.secure_url; // This is the image URL
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = "";
            if (form.image) {
                imageUrl = await uploadToCloudinary(form.image);
            }

            const res = await fetch(`${API_BASE_URL}/add_product`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description,
                    price: form.price,
                    category: form.category,
                    image: imageUrl,
                }),
            });

            if (res.ok) {
                setForm({
                    name: "",
                    description: "",
                    price: "",
                    category: "",
                    image: null,
                });
                alert("Food item added!");
            } else {
                const data = await res.json();
                alert("Failed to add product: " + (data?.error || "Unknown error"));
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-6">Add New Food Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Price ($)</label>
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Image</label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add Food Item"}
                </button>
            </form>
        </>
    );
}