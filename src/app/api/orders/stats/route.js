import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/lib/models/order";

// GET /api/orders/stats - Get revenue statistics
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'today';

        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            default:
                startDate.setHours(0, 0, 0, 0); // Default to today
        }

        // Get total revenue and orders
        const stats = await Order.aggregate([
            {
                $match: {
                    status: 'completed',
                    paymentStatus: 'completed',
                    orderDate: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    totalOrders: { $sum: 1 },
                    items: { $push: '$items' }
                }
            }
        ]);

        // Get top selling items
        const topItems = await Order.aggregate([
            {
                $match: {
                    status: 'completed',
                    paymentStatus: 'completed',
                    orderDate: { $gte: startDate, $lte: endDate }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.product.name' },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.subtotal' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        const result = stats[0] || { totalRevenue: 0, totalOrders: 0 };

        return NextResponse.json({
            totalRevenue: result.totalRevenue,
            totalOrders: result.totalOrders,
            averageOrderValue: result.totalOrders ? (result.totalRevenue / result.totalOrders) : 0,
            topItems,
            period
        });
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        return NextResponse.json(
            { error: "Failed to fetch revenue stats" },
            { status: 500 }
        );
    }
}
