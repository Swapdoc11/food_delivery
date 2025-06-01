'use client';

import { useState, useCallback } from 'react';
import { API_BASE_URL } from '@/utils/api';

export const useBilling = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculateBill = useCallback((items) => {
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const gst = subtotal * 0.18; // 18% GST
        const total = subtotal + gst;

        return {
            subtotal,
            gst,
            total
        };
    }, []);

    const generateBill = useCallback(async (orderId, paymentMethod = 'cash') => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/orders`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    paymentMethod,
                    status: 'completed',
                    paymentStatus: 'completed'
                })
            });

            if (!res.ok) {
                throw new Error('Failed to generate bill');
            }

            const data = await res.json();
            return data.order;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getRevenueStats = useCallback(async (period = 'today') => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/orders/stats?period=${period}`);
            if (!res.ok) {
                throw new Error('Failed to fetch revenue stats');
            }

            const data = await res.json();
            return {
                totalRevenue: data.totalRevenue || 0,
                totalOrders: data.totalOrders || 0,
                averageOrderValue: data.totalOrders ? (data.totalRevenue / data.totalOrders) : 0,
                topItems: data.topItems || []
            };
        } catch (err) {
            setError(err.message);
            // Return default values on error
            return {
                totalRevenue: 0,
                totalOrders: 0,
                averageOrderValue: 0,
                topItems: []
            };
        } finally {
            setLoading(false);
        }
    }, []);

    const printBill = useCallback((order) => {
        const { subtotal, gst, total } = calculateBill(order.items);
        
        const printContents = `
            <div style="max-width:500px;margin:auto;padding:20px;font-family:system-ui,-apple-system,sans-serif;">
                <div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #4f46e5;">
                    <h2 style="margin:0;color:#4f46e5;font-size:24px;">Food Delivery</h2>
                    <div style="font-size:14px;color:#666;margin-top:8px;">Table ${order.tableNumber}</div>
                    <div style="font-size:12px;color:#666;margin-top:4px;">${new Date().toLocaleString()}</div>
                    <div style="font-size:12px;color:#666;margin-top:4px;">Order #${order._id}</div>
                </div>
                
                <div style="margin-top:20px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:1px solid #eee;">
                                <th style="text-align:left;padding:8px 0;">Item</th>
                                <th style="text-align:center;padding:8px 0;">Qty</th>
                                <th style="text-align:right;padding:8px 0;">Price</th>
                                <th style="text-align:right;padding:8px 0;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr style="border-bottom:1px solid #f4f4f4;">
                                    <td style="padding:8px 0;">${item.product.name}</td>
                                    <td style="text-align:center;">${item.quantity}</td>
                                    <td style="text-align:right;">₹${item.price}</td>
                                    <td style="text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top:20px;padding-top:20px;border-top:1px solid #eee;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#666;">Subtotal:</span>
                        <span>₹${subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#666;">GST (18%):</span>
                        <span>₹${gst.toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px dashed #eee;font-weight:bold;">
                        <span>Total:</span>
                        <span>₹${total.toFixed(2)}</span>
                    </div>
                </div>

                <div style="margin-top:30px;text-align:center;padding-top:20px;border-top:2px solid #4f46e5;">
                    <div style="font-weight:500;">Thank you for dining with us!</div>
                    <div style="font-size:12px;color:#666;margin-top:4px;">Please visit again</div>
                </div>
            </div>
        `;

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Bill</title>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }, [calculateBill]);

    return {
        loading,
        error,
        calculateBill,
        generateBill,
        getRevenueStats,
        printBill
    };
};
