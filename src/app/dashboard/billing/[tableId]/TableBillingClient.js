'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { 
    addItemToTable,
    removeItemFromTable,
    updateItemQuantity,
    clearTable,
    setActiveTable,
    selectTableItems,
    selectTableTotal,
    selectTables,
    selectIsInitialized,
    initializeTableState
} from '@/slices/tableSlice';

const dummyProducts = [
    { id: 1, name: 'Burger', price: 149 },
    { id: 2, name: 'Pizza', price: 299 },
    { id: 3, name: 'Pasta', price: 199 },
    { id: 4, name: 'French Fries', price: 99 },
    { id: 5, name: 'Fries', price: 69 },
    { id: 6, name: 'Sandwich', price: 129 },
];

export default function TableBillingClient({ tableId }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);
    
    const isInitialized = useSelector(selectIsInitialized);
    const tables = Array.from({ length: 9 }, (_, i) => i + 1);
    
    // Initialize table state
    useEffect(() => {
        dispatch(initializeTableState());
    }, [dispatch]);

    // Don't render content until initialized
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    const allTables = useSelector(selectTables);
    
    console.log('TableBillingClient rendered with tableId:', tableId);

    useEffect(() => {
        if (!tableId) {
            console.log('No tableId, redirecting to tables');
            setError('Invalid table ID');
            return;
        }

        try {
            dispatch(setActiveTable(tableId));
            return () => dispatch(setActiveTable(null));
        } catch (err) {
            console.error('Error setting active table:', err);
            setError('Failed to load table data');
        }
    }, [tableId, dispatch]);

    // Use memoized selectors
    const tableItems = useSelector(state => {
        try {
            return selectTableItems(state, tableId) || [];
        } catch (err) {
            console.error('Error selecting table items:', err);
            return [];
        }
    });

    // Calculate totals
    const calculateSubTotal = () => {
        return tableItems.reduce((total, item) => total + (item.price * item.qty), 0);
    };

    const calculateGST = () => {
        return calculateSubTotal() * 0.18; // 18% GST
    };

    const calculateTotal = () => {
        return calculateSubTotal() + calculateGST();
    };

    const handleTableSwitch = (newTableId) => {
        router.push(`/dashboard/billing/${newTableId}`);
    };

    const handlePrint = () => {
        const printContents = `
            <div style="max-width:500px;margin:auto;padding:20px;font-family:system-ui,-apple-system,sans-serif;">
                <div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #4f46e5;">
                    <h2 style="margin:0;color:#4f46e5;font-size:24px;">Food Delivery</h2>
                    <div style="font-size:14px;color:#666;margin-top:8px;">Table ${tableId}</div>
                    <div style="font-size:12px;color:#666;margin-top:4px;">${new Date().toLocaleString()}</div>
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
                            ${tableItems.map(item => `
                                <tr style="border-bottom:1px solid #f4f4f4;">
                                    <td style="padding:8px 0;">${item.name}</td>
                                    <td style="text-align:center;">${item.qty}</td>
                                    <td style="text-align:right;">₹${item.price}</td>
                                    <td style="text-align:right;">₹${(item.price * item.qty).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top:20px;padding-top:20px;border-top:1px solid #eee;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#666;">Subtotal:</span>
                        <span>₹${calculateSubTotal().toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span style="color:#666;">GST (18%):</span>
                        <span>₹${calculateGST().toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px dashed #eee;font-weight:bold;">
                        <span>Total:</span>
                        <span>₹${calculateTotal().toFixed(2)}</span>
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
    };

    const handleClearTable = () => {
        dispatch(clearTable({ tableId }));
        alert('Table cleared successfully!');
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Table Switcher */}
            <div className="mb-8 overflow-x-auto">
                <div className="flex space-x-2 pb-4">
                    {tables.map(num => (
                        <button
                            key={num}
                            onClick={() => handleTableSwitch(num)}
                            className={`
                                px-4 py-2 rounded-lg flex flex-col items-center min-w-[100px]
                                ${num === parseInt(tableId) 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-white border hover:border-indigo-300'
                                }
                                ${allTables[num]?.length > 0 ? 'border-red-300' : 'border-gray-200'}
                            `}
                        >
                            <span className="font-medium">Table {num}</span>
                            <span className="text-xs mt-1">
                                {allTables[num]?.length > 0 
                                    ? `${allTables[num].length} items` 
                                    : 'Empty'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Table {tableId}</h2>
                    <p className="text-gray-600 mt-1">Manage orders for this table</p>
                </div>
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
                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dummyProducts.filter(product =>
                                product.name.toLowerCase().includes((search || '').toLowerCase())
                            ).map((product) => (
                                <div key={product.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex flex-col items-center">
                                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-3">₹{product.price.toFixed(2)}</p>
                                        <button
                                            onClick={() => {
                                                try {
                                                    dispatch(addItemToTable({ tableId, item: product }));
                                                } catch (err) {
                                                    console.error('Error adding item to cart:', err);
                                                    setError('Failed to add item to cart');
                                                }
                                            }}
                                            className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Add to Order
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="lg:w-[450px]">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                        
                        {tableItems.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No items in the order yet
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Order items */}
                                <div className="space-y-3">
                                    {tableItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{item.name}</h3>
                                                <p className="text-sm text-gray-600">₹{item.price}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => dispatch(updateItemQuantity({ 
                                                        tableId, 
                                                        itemId: item.id, 
                                                        quantity: Math.max(0, item.qty - 1)
                                                    }))}
                                                    className="p-1 rounded hover:bg-gray-100"
                                                >
                                                    -
                                                </button>
                                                <span>{item.qty}</span>
                                                <button
                                                    onClick={() => dispatch(updateItemQuantity({
                                                        tableId,
                                                        itemId: item.id,
                                                        quantity: item.qty + 1
                                                    }))}
                                                    className="p-1 rounded hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">₹{calculateSubTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span className="text-gray-600">GST (18%):</span>
                                        <span className="font-medium">₹{calculateGST().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold mt-4 pt-4 border-t text-indigo-600">
                                        <span>Total:</span>
                                        <span>₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Print Bill Button */}
                                <button
                                    onClick={handlePrint}
                                    className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                                    </svg>
                                    Print Bill
                                </button>

                                {/* Clear Table Button */}
                                <button
                                    onClick={handleClearTable}
                                    className="mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Clear Table
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
