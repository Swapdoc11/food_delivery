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
                        <li key={product.id} className="border p-3 rounded flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-base">{product.name}</h3>
                                <p className="text-gray-600 text-sm">₹{product.price}</p>
                            </div>
                            <button
                                onClick={() => addToCart(product)}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                                Add
                            </button>
                        </li>
                    ))}
                </ul>
            );
        }
        // Desktop grid
        return (
            <div className={`grid grid-cols-3 gap-4 ${scrollStyle}`}>
                {filteredProducts.map((product) => (
                    <div key={product.id} className="border p-3 rounded flex flex-col items-center">
                        <h3 className="font-medium text-base">{product.name}</h3>
                        <p className="text-gray-600 text-sm">₹{product.price}</p>
                        <button
                            onClick={() => addToCart(product)}
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 w-full"
                        >
                            Add
                        </button>
                    </div>
                ))}
            </div>
        );
    };

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
                                <th style="text-align:center;padding:8px 0;color:#2563eb;">Qty</th>
                                <th style="text-align:right;padding:8px 0;color:#2563eb;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cart.map(item => `
                                <tr>
                                    <td style="padding:4px 0;">${item.name}</td>
                                    <td style="text-align:center;padding:4px 0;">${item.qty}</td>
                                    <td style="text-align:right;padding:4px 0;">₹${(item.price * item.qty).toFixed(2)}</td>
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
        <div className="max-w-9xl mx-auto p-2 sm:p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-4 sm:mb-6 text-center sm:text-left">Billing Page</h1>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Products List */}
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Available Items</h2>
                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-3 sm:mb-4 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                    {renderProducts()}
                </div>

                {/* Bill Summary */}
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow flex-1 mt-4 md:mt-0">
                    <div ref={billRef}>
                        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Bill Summary</h2>
                        <div className="space-y-3 sm:space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center border-b pb-1 sm:pb-2">
                                    <span className="text-sm sm:text-base">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => decreaseQty(item.id)}
                                            className="px-2 py-1 bg-gray-200 rounded text-xs sm:text-sm font-bold hover:bg-gray-300"
                                            aria-label="Decrease quantity"
                                        >-</button>
                                        <span className="mx-1 text-sm sm:text-base">{item.qty}</span>
                                        <button
                                            onClick={() => increaseQty(item.id)}
                                            className="px-2 py-1 bg-gray-200 rounded text-xs sm:text-sm font-bold hover:bg-gray-300"
                                            aria-label="Increase quantity"
                                        >+</button>
                                        <span className="ml-2 text-sm sm:text-base">₹{(item.price * item.qty).toFixed(2)}</span>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="ml-2 text-red-500 hover:text-red-700 text-xs sm:text-sm"
                                            aria-label="Remove item"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
                                <div className="flex justify-between text-sm sm:text-base">
                                    <span>Subtotal:</span>
                                    <span>₹{calculateSubTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm sm:text-base">
                                    <span>GST (18%):</span>
                                    <span>₹{calculateGST().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base sm:text-lg">
                                    <span>Total:</span>
                                    <span>₹{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="mt-4 sm:mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition text-sm sm:text-base"
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