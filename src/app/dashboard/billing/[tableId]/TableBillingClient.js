'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchTables,
    updateTableStatus,
    createOrder,
    completeOrder,
    setActiveTable,
    updateItemQuantity,
    addItemToOrder,
    selectTables,
    selectActiveTable,
    selectCurrentOrder,
    selectTableLoading,
    selectTableError 
} from '@/slices/tableSlice';
import { API_BASE_URL } from '@/utils/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TableBillingClient({ tableId }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);    // Redux selectors
    const tablesMap = useSelector(selectTables);
    const activeTable = useSelector(selectActiveTable);
    const currentOrder = useSelector(selectCurrentOrder);
    const isLoading = useSelector(selectTableLoading);
    const tableError = useSelector(selectTableError);    // Convert tables object to array for rendering
    const tables = Object.values(tablesMap).sort((a, b) => a.tableNumber - b.tableNumber);

    // Fetch tables and products on component mount and set active table
    useEffect(() => {
        const initialize = async () => {
            try {
                await dispatch(fetchTables()).unwrap();
                // Set active table after fetching tables
                dispatch(setActiveTable(parseInt(tableId)));
                
                const res = await fetch(`${API_BASE_URL}/products`);
                const data = await res.json();
                setProducts(data.products || []);
            } catch (err) {
                console.error('Error initializing:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, [dispatch, tableId]);// Handle adding item to order
    const handleAddItem = useCallback(async (product) => {
        try {
            const tableNum = parseInt(tableId);
            if (!currentOrder) {
                // Create new order
                await dispatch(createOrder({
                    tableNumber: tableNum,
                    items: [{ 
                        product: product._id,
                        name: product.name,
                        quantity: 1,
                        price: product.price
                    }],
                    servedBy: 'Staff'
                })).unwrap();
            } else {
                // Update existing order in Redux only
                dispatch(addItemToOrder({
                    tableId: tableNum,
                    item: {
                        product: product._id,
                        name: product.name,
                        quantity: 1,
                        price: product.price
                    }
                }));
            }
        } catch (err) {
            console.error('Error adding item:', err);
            setError('Failed to add item to order');
        }
    }, [dispatch, tableId, currentOrder]);

    // Handle completing the order
    const handleCompleteOrder = useCallback(async () => {
        if (!currentOrder) return;

        try {
            await dispatch(completeOrder({
                orderId: currentOrder._id,
                paymentMethod: 'cash' // You might want to add payment method selection
            })).unwrap();

            // Clear the current order and reset table status
            await dispatch(updateTableStatus({
                tableNumber: parseInt(tableId),
                status: 'available',
                currentOrder: null
            })).unwrap();
        } catch (err) {
            console.error('Error completing order:', err);
            setError('Failed to complete order');
        }
    }, [dispatch, tableId, currentOrder]);

    // Handle clearing the table
    const handleClearTable = useCallback(async () => {
        if (!currentOrder) return;

        if (!window.confirm('Are you sure you want to clear this table? This will complete the current order.')) {
            return;
        }

        try {
            // First complete the order
            await dispatch(completeOrder({
                orderId: currentOrder._id,
                paymentMethod: 'cash' // Default to cash payment
            })).unwrap();

            // Then update table status
            await dispatch(updateTableStatus({
                tableNumber: parseInt(tableId),
                status: 'available',
                currentOrder: null
            })).unwrap();

            // Show success message
            alert('Table cleared successfully!');
        } catch (err) {
            console.error('Error clearing table:', err);
            alert('Failed to clear table: ' + err.message);
        }
    }, [dispatch, tableId, currentOrder]);    // Handle printing the bill
    const handlePrint = useCallback(async () => {
        if (!currentOrder) return;

        try {
            // Save the current order state to backend
            const res = await fetch(`${API_BASE_URL}/orders`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: currentOrder._id,
                    items: currentOrder.items
                })
            });

            if (!res.ok) throw new Error('Failed to save order');
            const data = await res.json();
            
            // Update Redux with the saved order
            dispatch(updateTableStatus({
                tableNumber: parseInt(tableId),
                status: 'engaged',
                currentOrder: data.order
            }));

            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Please allow popups to print the bill');
                return;
            }
        const billContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill - Table ${tableId}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .restaurant-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                    .info { font-size: 14px; color: #666; }
                    .items-header { display: grid; grid-template-columns: 40% 20% 20% 20%; font-weight: bold; margin-bottom: 10px; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    .item { display: grid; grid-template-columns: 40% 20% 20% 20%; margin: 5px 0; font-size: 14px; }
                    .totals { margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
                    .total-row { display: flex; justify-content: space-between; margin: 5px 0; font-size: 14px; }
                    .grand-total { font-weight: bold; font-size: 16px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #000; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="restaurant-name">Food Delivery</div>                    <div class="info">Table ${tableId}</div>
                    <div class="info">Date: ${new Date().toLocaleString()}</div>
                    <div class="info">Order #: ${currentOrder?._id?.slice(-6) || 'New'}</div>
                </div>
                <div class="items-header">
                    <div>Item</div>
                    <div>Rate</div>
                    <div>Qty</div>
                    <div>Amount</div>
                </div>                <div class="items">
                    ${currentOrder?.items?.map(item => {
                        const product = products.find(p => p._id === item.product);
                        const productName = product ? product.name : item.name || 'Unknown Item';
                        return `
                            <div class="item">
                                <div>${productName}</div>
                                <div>₹${item.price.toFixed(2)}</div>
                                <div>${item.quantity}</div>
                                <div>₹${(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>                        <span>₹${currentOrder?.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="total-row">
                        <span>GST (18%):</span>
                        <span>₹${currentOrder?.gst?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Total:</span>
                        <span>₹${currentOrder?.total?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
                <div class="footer">
                    <p>Thank you for dining with us!</p>
                    <p>Please visit again</p>
                </div>
            </body>
            </html>
        `;            // Write and print
            printWindow.document.write(billContent);
            printWindow.document.close();
            printWindow.print();
        } catch (err) {
            console.error('Error printing bill:', err);
            setError('Failed to print bill');
        }
    }, [tableId, currentOrder, dispatch, products]);

    // Filter products based on search
    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [products, search]);    // Handle updating item quantity
    const handleUpdateQuantity = useCallback((itemId, newQuantity) => {
        dispatch(updateItemQuantity({ 
            tableId: parseInt(tableId), 
            itemId, 
            quantity: newQuantity 
        }));
    }, [dispatch, tableId]);

    if (loading || isLoading) {
        return <LoadingSpinner message="Loading table data..." />;
    }

    if (error || tableError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600">{error || tableError}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Table Switcher */}            <div className="mb-8 overflow-x-auto">
                <div className="flex space-x-2 pb-4">
                    {tables.map(table => (                            <button
                                key={table._id}
                                onClick={() => {
                                    dispatch(setActiveTable(table.tableNumber));
                                    router.push(`/dashboard/billing/${table.tableNumber}`);
                                }}
                                className={`
                                px-4 py-2 rounded-lg flex flex-col items-center min-w-[100px]
                                ${table.tableNumber === parseInt(tableId) 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-white border hover:border-indigo-300'
                                }
                                ${table.currentOrder ? 'border-red-300' : 'border-gray-200'}
                            `}
                        >                            <span className="font-medium">Table {table.tableNumber}</span>                            <span className="text-xs mt-1">
                                {table.currentOrder?.items?.length 
                                    ? `${table.currentOrder.items.length} items` 
                                    : 'Empty'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Table {tableId}</h2>
                    <p className="text-gray-600 mt-1">Manage orders for this table</p>
                </div>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Back to Dashboard
                </button>
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
                            {filteredProducts.map((product) => (
                                <div key={product._id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex flex-col items-center">
                                        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-3">₹{product.price.toFixed(2)}</p>
                                        <button
                                            onClick={() => handleAddItem(product)}
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
                          {!currentOrder?.items?.length ? (
                            <div className="text-center text-gray-500 py-8">
                                No items in the order yet
                            </div>
                        ) : (
                            <div className="space-y-4">                                {/* Order items */}
                                <div className="space-y-3">
                                    {currentOrder.items.map((item, index) => {
                                        // Find the corresponding product to get the name
                                        const product = products.find(p => p._id === item.product);
                                        const productName = product ? product.name : item.name || 'Unknown Item';
                                        
                                        return (
                                            <div key={`${item.product}-${index}`} className="flex items-center justify-between py-2">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{productName}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span>₹{item.price} × {item.quantity}</span>
                                                        <span>=</span>
                                                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 ml-4">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.product, Math.max(0, item.quantity - 1))}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 border border-gray-200"
                                                    >
                                                        <span className="text-gray-600">−</span>
                                                    </button>
                                                    <span className="w-6 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.product, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 border border-gray-200"
                                                    >
                                                        <span className="text-gray-600">+</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Totals */}
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">₹{currentOrder.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span className="text-gray-600">GST (18%):</span>
                                        <span className="font-medium">₹{currentOrder.gst.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold mt-4 pt-4 border-t text-indigo-600">
                                        <span>Total:</span>
                                        <span>₹{currentOrder.total.toFixed(2)}</span>
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
