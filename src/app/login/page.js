"use client";
import Link from "next/link";
import { useState } from "react";


export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your login logic here
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        setError("");
        // Example: call API or redirect
        alert("Logged in!");
    };

    return (
        //    <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-lg shadow-xl p-10 max-w-md w-full">
        <>
            <h1 className="font-medium text-xl mb-3 text-center">
                Login
            </h1>
            <div className="flex flex-row flex-wrap gap-2 mb-2">
                <input type="text" className="border-2 flex-1 p-2" placeholder="Username" />
                <input type="text" className="border-2 flex-1 p-2" placeholder="Password" />
            </div>
            <div className="flex flex-col gap-2">
                <input
                    type="button"
                    className="border-2 hover:border-black w-full p-2 hover:bg-red-600 hover:text-amber-200 cursor-pointer"
                    value="Login"
                    readOnly
                />
                <button
                    className="w-full p-2 text-center text-blue-600 hover:text-red-600 cursor-pointer"
                >
                    Already registered? Login
                </button>
            </div>
        </>
        // </div>
    );
}