'use client';
import { useState, useRef } from 'react';

const BillingPage = () => {
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const billRef = useRef(null);

    const dummyProducts = [
        { id: 1, name: 'Burger', price: 149 },
        { id: 2, name: 'Pizza', price: 299 },
        { id: 3, name: 'Pasta', price: 199 },
        { id: 4, name: 'French Fries', price: 99 },
        { id: 5, name: 'Fries', price: 69 },
    ];

    const addToCart = (product) => {
        setCart([...cart, product]);
    };

    const removeFromCart = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
    };

    const calculateSubTotal = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };

    const calculateGST = () => {
        return calculateSubTotal() * 0.18;
    };

    const calculateTotal = () => {
        return calculateSubTotal() + calculateGST();
    };

    // Filter products based on search
    const filteredProducts = dummyProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    // Print bill handler with attractive design
    const handlePrint = () => {
        const printContents = `
            <div style="max-width:400px;margin:auto;font-family:sans-serif;">
                <div style="text-align:center;padding:16px 0;">
                    <h2 style="margin:0;color:#2563eb;">Food Delivery</h2>
                    <div style="font-size:14px;color:#555;">Thank you for your order!</div>
                </div>
                <hr style="margin:16px 0;border:0;border-top:1px solid #e5e7eb;">
                <div>
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr>
                                <th style="text-align:left;padding:8px 0;color:#2563eb;">Item</th>
                                <th style="text-align:right;padding:8px 0;color:#2563eb;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cart.map(item => `
                                <tr>
                                    <td style="padding:4px 0;">${item.name}</td>
                                    <td style="text-align:right;padding:4px 0;">₹${item.price}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <hr style="margin:16px 0;border:0;border-top:1px solid #e5e7eb;">
                <div style="font-size:15px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span>Subtotal:</span>
                        <span>₹${calculateSubTotal().toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span>GST (18%):</span>
                        <span>₹${calculateGST().toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:17px;color:#2563eb;">
                        <span>Total:</span>
                        <span>₹${calculateTotal().toFixed(2)}</span>
                    </div>
                </div>
                <hr style="margin:16px 0;border:0;border-top:1px dashed #cbd5e1;">
                <div style="text-align:center;font-size:13px;color:#888;">
                    <div>Order Date: ${new Date().toLocaleString()}</div>
                    <div style="margin-top:8px;">Powered by Food Delivery</div>
                </div>
            </div>
        `;
        const printWindow = window.open('', '', 'height=600,width=400');
        printWindow.document.write('<html><head><title>Print Bill</title>');
        printWindow.document.write('</head><body style="background:#f3f4f6;">');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Billing Page</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Products List */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Available Items</h2>
                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-4 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} className="border p-3 rounded">
                                    <h3 className="font-medium">{product.name}</h3>
                                    <p className="text-gray-600">₹{product.price}</p>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center text-gray-500">No items found.</div>
                        )}
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <div ref={billRef}>
                        <h2 className="text-xl font-semibold mb-4">Bill Summary</h2>
                        <div className="space-y-4">
                            {cart.map((item, index) => (
                                <div key={index} className="flex justify-between items-center border-b pb-2">
                                    <span>{item.name}</span>
                                    <div>
                                        <span className="mr-4">₹{item.price}</span>
                                        <button
                                            onClick={() => removeFromCart(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>₹{calculateSubTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>GST (18%):</span>
                                    <span>₹{calculateGST().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>₹{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                        disabled={cart.length === 0}
                    >
                        Print Bill
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;