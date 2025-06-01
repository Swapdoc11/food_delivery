import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Table from "@/app/lib/models/table";

// GET all tables
export async function GET() {
    try {
        await connectDB();
        const tables = await Table.find({ isActive: true })
            .sort({ tableNumber: 1 })
            .select('-__v');
        
        return NextResponse.json({ tables });
    } catch (error) {
        console.error('Error fetching tables:', error);
        return NextResponse.json(
            { error: "Failed to fetch tables" },
            { status: 500 }
        );
    }
}

// POST new table
export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();

        // Validate required fields
        if (!data.tableNumber || !data.capacity) {
            return NextResponse.json(
                { error: "Table number and capacity are required" },
                { status: 400 }
            );
        }

        // Check if table number already exists
        const existingTable = await Table.findOne({ tableNumber: data.tableNumber });
        if (existingTable) {
            return NextResponse.json(
                { error: "Table number already exists" },
                { status: 400 }
            );
        }        const table = await Table.create({
            tableNumber: data.tableNumber,
            capacity: data.capacity,
            status: 'available',
            isActive: true
        });

        return NextResponse.json({
            message: "Table created successfully",
            table
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating table:', error);
        return NextResponse.json(
            { error: "Failed to create table" },
            { status: 500 }
        );
    }
}

// PUT update table
export async function PUT(req) {
    try {
        await connectDB();
        const data = await req.json();

        if (!data.tableNumber) {
            return NextResponse.json(
                { error: "Table number is required" },
                { status: 400 }
            );
        }

        const table = await Table.findOne({ tableNumber: data.tableNumber });
        if (!table) {
            return NextResponse.json(
                { error: "Table not found" },
                { status: 404 }
            );
        }

        // Update only provided fields
        const updates = {
            ...(data.capacity && { capacity: data.capacity }),
            ...(data.status && { status: data.status }),
            ...(data.currentOrder && { currentOrder: data.currentOrder }),
            updatedAt: new Date()
        };

        const updatedTable = await Table.findByIdAndUpdate(
            table._id,
            updates,
            { new: true, runValidators: true }
        );

        return NextResponse.json({
            message: "Table updated successfully",
            table: updatedTable
        });
    } catch (error) {
        console.error('Error updating table:', error);
        return NextResponse.json(
            { error: "Failed to update table" },
            { status: 500 }
        );
    }
}

// DELETE table (soft delete)
export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const tableNumber = searchParams.get('tableNumber');

        if (!tableNumber) {
            return NextResponse.json(
                { error: "Table number is required" },
                { status: 400 }
            );
        }

        const table = await Table.findOne({ tableNumber });
        
        if (!table) {
            return NextResponse.json(
                { error: "Table not found" },
                { status: 404 }
            );
        }

        // Soft delete by setting isActive to false
        table.isActive = false;
        await table.save();

        return NextResponse.json({
            message: "Table deleted successfully",
            tableNumber
        });
    } catch (error) {
        console.error('Error deleting table:', error);
        return NextResponse.json(
            { error: "Failed to delete table" },
            { status: 500 }
        );
    }
}
