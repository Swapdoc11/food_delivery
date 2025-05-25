import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import Product from "../../lib/add_product";
import fs from "fs";
import path from "path";
export async function POST(req) {
    try {
        await connectDB();


        const data = await req.formData();
        const file = data.get("image");
        if(!file) {
            return NextResponse.json(
                { error: "Image file is required" },
                { status: 400 }
            );
        }
        if (file && file.size > 5 * 1024 * 1024) { // Check if file size exceeds 5MB
            return NextResponse.json(
                { error: "Image size exceeds 5MB limit" },
                { status: 400 }
            );
        }
        console.log(file)
        const bytedata = await file.arrayBuffer(); // Ensure the file is processed correctly
        const buffer = Buffer.from(bytedata);
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `./public/${fileName}`;
        
        fs.writeFileSync(filePath, buffer); // Save the file to the public directory
        data.set("image", fileName); // Update the form data with the new file name
        console.log("File saved at:", filePath);


        const product = await Product.create({
            name: data.get('name'),
            description: data.get('description'),
            price: data.get('price'),
            category: data.get('category'),
            image:fileName
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
        await connectDB();
        const products = await Product.find().sort({ createdAt: -1 });
        return NextResponse.json({ products }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch products", details: error.message },
            { status: 500 }
        );
    }
}