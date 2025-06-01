import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        ref: 'Table'
    },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    subtotal: {
        type: Number,
        required: true
    },
    gst: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi'],
        default: 'cash'
    },
    servedBy: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for better query performance and reporting
orderSchema.index({ orderDate: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ tableNumber: 1 });
orderSchema.index({ paymentStatus: 1 });

// Static method for revenue calculations
orderSchema.statics.getRevenue = async function(startDate, endDate) {
    const match = {
        status: 'completed',
        paymentStatus: 'completed',
        orderDate: { $gte: startDate, $lte: endDate }
    };

    const result = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$total' },
                totalOrders: { $sum: 1 },
                averageOrderValue: { $avg: '$total' }
            }
        }
    ]);

    return result[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };
};

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
