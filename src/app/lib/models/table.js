import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({    tableNumber: {
        type: Number,
        required: [true, 'Table number is required'],
        min: [1, 'Table number must be positive']
    },
    capacity: {
        type: Number,
        required: [true, 'Seating capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    status: {
        type: String,
        enum: ['available', 'engaged', 'reserved'],
        default: 'available'
    },
    currentOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
tableSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Indexes for better query performance
tableSchema.index({ tableNumber: 1 }, { unique: true });
tableSchema.index({ status: 1 });

const Table = mongoose.models.Table || mongoose.model('Table', tableSchema);

export default Table;
