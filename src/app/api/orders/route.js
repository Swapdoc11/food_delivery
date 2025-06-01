import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/lib/models/order";
import Table from "@/app/lib/models/table";

// GET orders with filtering
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        
        // Parse query parameters
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')) : new Date(0);
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')) : new Date();
        const status = searchParams.get('status');
        const tableNumber = searchParams.get('tableNumber');

        // Build query
        const query = {
            orderDate: { $gte: startDate, $lte: endDate }
        };
        if (status) query.status = status;
        if (tableNumber) query.tableNumber = parseInt(tableNumber);

        const orders = await Order.find(query)
            .populate('items.product', 'name price')
            .sort({ orderDate: -1 });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

// POST new order
export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();

        // Validate required fields
        if (!data.tableNumber || !data.items || !data.items.length) {
            return NextResponse.json(
                { error: "Table number and items are required" },
                { status: 400 }
            );
        }

        // Calculate totals
        const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const gst = subtotal * 0.18; // 18% GST
        const total = subtotal + gst;

        // Create order
        const order = await Order.create({
            tableNumber: data.tableNumber,
            items: data.items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            })),
            subtotal,
            gst,
            total,
            servedBy: data.servedBy || 'Staff',
            paymentMethod: data.paymentMethod || 'cash'
        });

        // Update table status
        await Table.findOneAndUpdate(
            { tableNumber: data.tableNumber },
            { 
                status: 'engaged',
                currentOrder: order._id
            }
        );

        return NextResponse.json({
            message: "Order created successfully",
            order
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}

// PUT complete order and generate bill
export async function PUT(req) {
    try {
        await connectDB();
        const data = await req.json();

        if (!data.orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        const order = await Order.findById(data.orderId);
        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Update order status
        order.status = 'completed';
        order.paymentStatus = 'completed';
        order.completedAt = new Date();
        if (data.paymentMethod) {
            order.paymentMethod = data.paymentMethod;
        }

        await order.save();

        // Update table status
        await Table.findOneAndUpdate(
            { tableNumber: order.tableNumber },
            { 
                status: 'available',
                currentOrder: null
            }
        );

        return NextResponse.json({
            message: "Order completed successfully",
            order
        });
    } catch (error) {
        console.error('Error completing order:', error);
        return NextResponse.json(
            { error: "Failed to complete order" },
            { status: 500 }
        );
    }
}

// GET revenue statistics
export async function getRevenue(startDate, endDate) {
    try {
        await connectDB();
        
        const revenue = await Order.getRevenue(startDate, endDate);
        
        // Get top selling items
        const topItems = await Order.aggregate([
            {
                $match: {
                    status: 'completed',
                    orderDate: { $gte: startDate, $lte: endDate }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.subtotal' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        return {
            revenue,
            topItems
        };
    } catch (error) {
        console.error('Error calculating revenue:', error);
        throw error;
    }
}
