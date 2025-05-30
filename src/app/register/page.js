"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/slices/authSlice";
import { API_BASE_URL } from "@/utils/api";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: "",
        surname: "",
        country: "",
        state: "",
        city: "",
        phone: "",
        email: "",
        password: "",
        address: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            setError("Name, email, and password are required.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Registration failed");
                return;
            }
            dispatch(setCredentials({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                user: data.user,
            }));
            router.push("/dashboard");
        } catch (err) {
            setError("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-white to-pink-50">
            {/* Left side - Form */}
            <div className="w-full lg:w-1/2 px-6 py-8 lg:px-16 xl:px-24 overflow-y-auto">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <Image
                            src="/foodie.png"
                            alt="Logo"
                            width={100}
                            height={100}
                            className="mx-auto mb-4"
                        />
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                            Create Account
                        </h2>
                        <p className="text-sm text-gray-600">
                            Join us and start ordering delicious food
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150"
                                    placeholder="Enter your name"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                                <input
                                    type="text"
                                    name="surname"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150"
                                    placeholder="Enter your surname"
                                    value={form.surname}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150"
                                    placeholder="Create password"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150"
                                    placeholder="Country"
                                    value={form.country}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150"
                                    placeholder="State"
                                    value={form.state}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150"
                                    placeholder="City"
                                    value={form.city}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150"
                                placeholder="Enter phone number"
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                name="address"
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150"
                                placeholder="Enter your complete address"
                                value={form.address}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-[1.02]"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <Link
                                href="/login"
                                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition duration-150 ease-in-out"
                            >
                                Already have an account?
                                <span className="ml-1 font-semibold hover:underline">
                                    Sign in
                                </span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right side - Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 items-center justify-center relative">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <Image
                    src="/foodie2.png"
                    alt="Food Delivery"
                    layout="fill"
                    objectFit="cover"
                    className="transform hover:scale-105 transition-transform duration-500"
                    priority
                />
                <div className="relative z-10 text-white text-center p-8">
                    <h1 className="text-5xl font-bold mb-4">Join Our Community</h1>
                    <p className="text-xl">Register now to explore amazing food options and get exclusive deals.</p>
                </div>
            </div>
        </div>
    );
}