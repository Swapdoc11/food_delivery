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
        { id: 6, name: 'Sandwich', price: 129 },
        { id: 7, name: 'Salad', price: 119 },
        { id: 8, name: 'Noodles', price: 159 },
        { id: 9, name: 'Wrap', price: 139 },
        { id: 10, name: 'Soup', price: 109 },
        { id: 11, name: 'Taco', price: 149 },
        { id: 12, name: 'Samosa', price: 49 },
    ];

    // Add to cart: increase qty if exists, else add new
    const addToCart = (product) => {
        setCart((prevCart) => {
            const idx = prevCart.findIndex((item) => item.id === product.id);
            if (idx !== -1) {
                // Already in cart, increase qty
                const updated = [...prevCart];
                updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
                return updated;
            }
            // Not in cart, add with qty 1
            return [...prevCart, { ...product, qty: 1 }];
        });
    };

    // Remove one quantity, or remove item if qty is 1
    const decreaseQty = (productId) => {
        setCart((prevCart) => {
            const idx = prevCart.findIndex((item) => item.id === productId);
            if (idx !== -1) {
                if (prevCart[idx].qty > 1) {
                    const updated = [...prevCart];
                    updated[idx] = { ...updated[idx], qty: updated[idx].qty - 1 };
                    return updated;
                } else {
                    // Remove item
                    return prevCart.filter((item) => item.id !== productId);
                }
            }
            return prevCart;
        });
    };

    // Remove item from cart completely
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const increaseQty = (productId) => {
        setCart((prevCart) => {
            const idx = prevCart.findIndex((item) => item.id === productId);
            if (idx !== -1) {
                const updated = [...prevCart];
                updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
                return updated;
            }
            return prevCart;
        });
    };

    const calculateSubTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.qty, 0);
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

    // Responsive: detect window width
    const isBrowser = typeof window !== "undefined";
    // SSR/CSR consistency for width
    const [windowWidth, setWindowWidth] = useState(isBrowser ? window.innerWidth : 1200);
    if (isBrowser) {
        window.onresize = () => setWindowWidth(window.innerWidth);
    }
    const isMobileOrTablet = windowWidth < 1024;

    // Scrollable container style
    const scrollStyle = isMobileOrTablet
        ? filteredProducts.length > 6
            ? "max-h-96 overflow-y-auto"
            : ""
        : filteredProducts.length > 9
            ? "max-h-96 overflow-y-auto"
            : "";

    // Render products as list on mobile/tablet, grid on desktop
    const renderProducts = () => {
        if (isMobileOrTablet) {
            return (
                <ul className={`flex flex-col gap-3 ${scrollStyle}`}>
                    {filteredProducts.map((product) => (
                        <li key={product.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                                    <p className="text-gray-600 text-sm">₹{product.price.toFixed(2)}</p>
                                </div>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            );
        }
        // Desktop grid
        return (
            <div className={`grid grid-cols-3 gap-4 ${scrollStyle}`}>
                {filteredProducts.map((product) => (
                    <div key={product.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex flex-col items-center">
                            <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-gray-600 text-sm mb-3">₹{product.price.toFixed(2)}</p>
                            <button
                                onClick={() => addToCart(product)}
                                className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Print bill handler with attractive design
    const handlePrint = () => {
        const printContents = `
            <div style="max-width:550px;margin:10px auto;font-family:'Segoe UI',system-ui,sans-serif;background:white;padding:15px;box-shadow:0 0 10px rgba(0,0,0,0.1);border-radius:8px;">
                <div style="text-align:center;padding:15px 0;border-bottom:2px solid #4f46e5;">
                    <h2 style="margin:0;color:#4f46e5;font-size:20px;font-weight:600;">Food Delivery</h2>
                    <div style="font-size:12px;color:#6b7280;margin-top:6px;">Delicious food at your doorstep</div>
                </div>
                
                <div style="margin:16px 0;text-align:center;">
                    <div style="font-size:12px;color:#374151;">Order Date: ${new Date().toLocaleString()}</div>
                    <div style="font-size:12px;color:#374151;margin-top:3px;">Bill No: #${Math.floor(Math.random() * 100000)}</div>
                </div>

                <div style="margin:16px 0;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:1px solid #e5e7eb;">
                                <th style="text-align:left;padding:8px 0;color:#4f46e5;font-size:12px;">Item</th>
                                <th style="text-align:center;padding:8px 0;color:#4f46e5;font-size:12px;">Rate</th>
                                <th style="text-align:center;padding:8px 0;color:#4f46e5;font-size:12px;">Qty</th>
                                <th style="text-align:right;padding:8px 0;color:#4f46e5;font-size:12px;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cart.map(item => `
                                <tr style="border-bottom:1px solid #f3f4f6;">
                                    <td style="padding:8px 0;font-size:12px;color:#374151;">${item.name}</td>
                                    <td style="text-align:center;padding:8px 0;font-size:12px;color:#374151;">₹${item.price}</td>
                                    <td style="text-align:center;padding:8px 0;font-size:12px;color:#374151;">${item.qty}</td>
                                    <td style="text-align:right;padding:8px 0;font-size:12px;color:#374151;">₹${(item.price * item.qty).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="margin:16px 0;padding-top:12px;border-top:1px solid #e5e7eb;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                        <span style="font-size:12px;color:#6b7280;">Subtotal:</span>
                        <span style="font-size:12px;color:#374151;">₹${calculateSubTotal().toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                        <span style="font-size:12px;color:#6b7280;">GST (18%):</span>
                        <span style="font-size:12px;color:#374151;">₹${calculateGST().toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px dashed #e5e7eb;">
                        <span style="font-size:14px;font-weight:600;color:#4f46e5;">Total:</span>
                        <span style="font-size:14px;font-weight:600;color:#4f46e5;">₹${calculateTotal().toFixed(2)}</span>
                    </div>
                </div>

                <div style="margin-top:24px;padding-top:16px;border-top:2px solid #4f46e5;text-align:center;">
                    <div style="font-size:12px;color:#374151;font-weight:500;">Thank you for your order!</div>
                    <div style="font-size:11px;color:#6b7280;margin-top:6px;">Visit us again</div>
                    <div style="margin-top:12px;font-size:10px;color:#9ca3af;">
                        Powered by Food Delivery
                    </div>
                </div>
            </div>
        `;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Food Delivery - Bill</title>');
        printWindow.document.write('<style>@page { size: 4in 6in; margin: 0; } @media print { body { margin: 0; padding: 0; } }</style>');
        printWindow.document.write('</head><body style="margin:0;background:#f3f4f6;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;">');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Billing Dashboard</h2>
                <p className="text-gray-600 mt-1">Process orders and generate bills</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Products List */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Items</h2>
                        
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 text-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        {isMobileOrTablet ? (
                            <ul className={`flex flex-col gap-3 ${scrollStyle}`}>
                                {filteredProducts.map((product) => (
                                    <li key={product.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{product.name}</h3>
                                                <p className="text-gray-600 text-sm">₹{product.price.toFixed(2)}</p>
                                            </div>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                            >
                                                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className={`grid grid-cols-3 gap-4 ${scrollStyle}`}>
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <div className="flex flex-col items-center">
                                            <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                                            <p className="text-gray-600 text-sm mb-3">₹{product.price.toFixed(2)}</p>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                            >
                                                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="lg:w-[450px]">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div ref={billRef}>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Summary</h2>
                            <div className="space-y-4">
                                {/* Bill Table Header */}
                                <div className="flex items-center pb-3 border-b border-gray-200 text-sm font-medium text-gray-600">
                                    <span className="w-2/5">Item</span>
                                    <span className="w-1/5 text-center">Rate</span>
                                    <span className="w-1/5 text-center">Qty</span>
                                    <span className="w-1/5 text-right">Amount</span>
                                </div>

                                {/* Bill Items */}
                                <div className="space-y-3">
                                    {cart.length === 0 ? (
                                        <div className="py-6 text-center text-gray-500 text-sm">
                                            No items added to bill yet
                                        </div>
                                    ) : (
                                        cart.map((item) => (
                                            <div key={item.id} className="flex items-center text-sm">
                                                <span className="w-2/5 font-medium text-gray-900">{item.name}</span>
                                                <span className="w-1/5 text-center text-gray-600">₹{item.price.toFixed(2)}</span>
                                                <div className="w-1/5 flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => decreaseQty(item.id)}
                                                        className="p-1 rounded-md hover:bg-gray-100 text-gray-600"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        </svg>
                                                    </button>
                                                    <span className="w-6 text-center font-medium">{item.qty}</span>
                                                    <button
                                                        onClick={() => increaseQty(item.id)}
                                                        className="p-1 rounded-md hover:bg-gray-100 text-gray-600"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <span className="w-1/5 text-right font-medium text-gray-900">₹{(item.price * item.qty).toFixed(2)}</span>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="ml-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                    aria-label="Remove item"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Bill Totals */}
                                {cart.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-gray-200">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium">₹{calculateSubTotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">GST (18%):</span>
                                            <span className="font-medium">₹{calculateGST().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-semibold text-indigo-600 pt-2">
                                            <span>Total:</span>
                                            <span>₹{calculateTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handlePrint}
                            disabled={cart.length === 0}
                            className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Bill
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;