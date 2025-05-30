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
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Add New Food Item</h2>
                <p className="text-gray-600 mt-1">Create a new product in your food catalog</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm border p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                            placeholder="Enter product name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                        >
                            <option value="">Select category</option>
                            <option value="Burgers">Burgers</option>
                            <option value="Pizza">Pizza</option>
                            <option value="Pasta">Pasta</option>
                            <option value="Salads">Salads</option>
                            <option value="Desserts">Desserts</option>
                            <option value="Beverages">Beverages</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                        placeholder="Enter product description"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                        <div className="flex items-center">
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 text-center flex items-center justify-center text-sm text-gray-600"
                            >
                                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {form.image ? form.image.name : 'Choose Image'}
                            </label>
                        </div>
                    </div>
                </div>

                {form.image && (
                    <div className="mt-4">
                        <img
                            src={URL.createObjectURL(form.image)}
                            alt="Preview"
                            className="h-32 object-cover rounded-lg shadow-sm"
                        />
                    </div>
                )}

                <div className="flex items-center justify-end gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => setForm({ name: '', description: '', price: '', category: '', image: null })}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors text-sm font-medium"
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding Product...
                            </div>
                        ) : (
                            'Add Product'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}