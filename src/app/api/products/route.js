import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/lib/models/product";

// GET all products
export async function GET() {
    try {
        await connectDB();
        const products = await Product.find({})
            .sort({ createdAt: -1 }) // Sort by newest first
            .select('-__v'); // Exclude version key
        
        return NextResponse.json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

// POST new product
export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();

        // Validate required fields
        if (!data.name || !data.description || !data.price || !data.category) {
            return NextResponse.json(
                { error: "Name, description, price, and category are required" },
                { status: 400 }
            );
        }

        // Validate price
        if (isNaN(data.price) || data.price < 0) {
            return NextResponse.json(
                { error: "Price must be a valid positive number" },
                { status: 400 }
            );
        }

        // Create new product
        const product = await Product.create({
            name: data.name,
            description: data.description,
            price: parseFloat(data.price),
            category: data.category,
            image: data.image || null // Make image optional
        });

        return NextResponse.json({
            message: "Product created successfully",
            product
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                { error: "Validation failed", details: validationErrors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}

// PUT update product
export async function PUT(req) {
    try {
        await connectDB();
        const data = await req.json();

        if (!data._id) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        const product = await Product.findById(data._id);
        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Update only provided fields
        const updates = {
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.price && { price: parseFloat(data.price) }),
            ...(data.category && { category: data.category }),
            ...(data.image && { image: data.image }),
            updatedAt: new Date()
        };

        const updatedProduct = await Product.findByIdAndUpdate(
            data._id,
            updates,
            { new: true, runValidators: true }
        );

        return NextResponse.json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                { error: "Validation failed", details: validationErrors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

// DELETE product
export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        const product = await Product.findByIdAndDelete(id);
        
        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Product deleted successfully",
            productId: id
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
