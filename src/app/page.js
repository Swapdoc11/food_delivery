"use client"
import Image from "next/image";
// import foodie from "./../../public/foodie2.png"
import foodie from "./../../public/resto.jpg"
import Link from "next/link";
import { useState } from "react";
import RegisterPage from "./register/page";
import LoginPage from "./login/page";
import DashboardPage from "./dashboard/page";

export default function Home() {

const [activeTab, setActiveTab] = useState("Login");
  return (
    // <div className="relative min-h-screen flex items-center justify-center">
    //   {/* Cover Image */}
    //   <Image
    //     src={foodie}
    //     alt="foodie"
    //     fill
    //     priority
    //     className="object-cover w-full h-full absolute top-0 left-0 z-0"
    //     style={{ filter: "brightness(0.6)" }}
    //   />
    //   <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-lg shadow-xl p-10 max-w-md w-full">
    //   <div className="flex mb-6">
    //     <button
    //       className={`flex-1 py-2 px-4 rounded-tl-lg rounded-tr-none rounded-bl-none rounded-br-none font-semibold transition-colors ${
    //         activeTab === "login"
    //           ? "bg-blue-600 text-white"
    //           : "bg-gray-200 text-gray-700"
    //       }`}
    //       onClick={() => setActiveTab("login")}
    //       type="button"
    //     >
    //       Login
    //     </button>
    //     <button
    //       className={`flex-1 py-2 px-4 rounded-tr-lg rounded-tl-none rounded-bl-none rounded-br-none font-semibold transition-colors ${
    //         activeTab === "register"
    //           ? "bg-blue-600 text-white"
    //           : "bg-gray-200 text-gray-700"
    //       }`}
    //       onClick={() => setActiveTab("register")}
    //       type="button"
    //     >
    //       Register
    //     </button>
    //   </div>
    //   {activeTab === "login" ? <LoginPage /> : <RegisterPage />}
        
    //   </div>

    // </div>
    <DashboardPage />
  );
}
