import { NextResponse } from "next/server";
import Product from "../../lib/add_product";
import mongoose from "mongoose";
import { MONGODB_URI } from "@/app/lib/db";

export async function POST(req) {
    try {
        await mongoose.connect(MONGODB_URI);

        const data = await req.json();

        // Validate required fields
        if (!data.name || !data.description || !data.price || !data.category || !data.image) {
            return NextResponse.json(
                { error: "All fields including image URL are required" },
                { status: 400 }
            );
        }

        const product = await Product.create({
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            image: data.image,
        });

        return NextResponse.json(
            { message: "Product added successfully", product },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to add product", details: error.message },
            { status: 500 }
        );
    }
}
export async function GET() {
    try {
        // await connectDB();
        console.log("MongoDB connected");
        await mongoose.connect(MONGODB_URI)
        const products = await Product.find().sort({ createdAt: -1 });
        return NextResponse.json({ products }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch products", details: error.message },
            { status: 500 }
        );
    }
}