"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
   
    return (
    
        <>
            <h1 className="font-medium text-xl mb-3 text-center">
                Register
            </h1>
            <div className="flex flex-row flex-wrap gap-2 mb-2">
                <input type="text" className="border-2 flex-1 p-2" placeholder="Name" />
                <input type="text" className="border-2 flex-1 p-2" placeholder="Surname" />
            </div>
            <div className="flex flex-row flex-wrap gap-2 mb-2">
                <input type="text" className="border-2 flex-1 p-2" placeholder="Country" />
                <input type="text" className="border-2 flex-1 p-2" placeholder="State or Province" />
            </div>
            <div className="flex flex-col gap-2 mb-2">
                <input type="text" className="border-2 p-2" placeholder="City or Place" />
                <input type="text" className="border-2 p-2" placeholder="Phone" />
                <input type="text" className="border-2 p-2" placeholder="Email" />
                <textarea className="border-2 p-2" placeholder="Complete Address"></textarea>
            </div>
            <div className="flex flex-col gap-2">
                <input type="button" className="border-2 hover:border-black w-full p-2 hover:bg-red-600 hover:text-amber-200 cursor-pointer" value="Register" readOnly />
                <button href="#" className="w-full p-2 text-center text-blue-600 hover:text-red-600 cursor-pointer">Already registered? Login</button>
            </div>
        
        </>
        
    );
}