'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { API_BASE_URL } from '@/utils/api';
import { fetchTables } from '@/slices/tableSlice';
import LoadingSpinner from '@/components/LoadingSpinner';

const TablesLayout = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTable, setNewTable] = useState({
        tableNumber: '',
        capacity: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
      // Get tables from Redux store    // Get tables and loading state from Redux store
    const tablesObj = useSelector(state => state.table.tables);
    const isLoading = useSelector(state => state.table.loading);
    
    // Convert tables object to array and sort by table number
    const tables = Object.values(tablesObj || {}).sort((a, b) => a.tableNumber - b.tableNumber);
    
    // Fetch tables on component mount
    useEffect(() => {
        dispatch(fetchTables());
    }, [dispatch]);

    // Handle adding new table
    const handleAddTable = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/tables`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableNumber: parseInt(newTable.tableNumber),
                    capacity: parseInt(newTable.capacity)
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to add table');
            }            // Reset form and close modal
            setNewTable({ tableNumber: '', capacity: '' });
            setIsModalOpen(false);
            // Refresh tables list
            await dispatch(fetchTables()).unwrap();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTableClick = (tableNumber) => {
        router.push(`/dashboard/billing/${tableNumber}`);
    };    if (isLoading) {
        return <LoadingSpinner message="Loading tables..." />;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Restaurant Tables</h2>
                    <p className="text-gray-600 mt-1">Select a table to manage orders</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Table
                </button>
            </div>

            {error && (
                <div className="mb-6 text-sm text-red-600 bg-red-50 rounded-md p-3">
                    {error}
                </div>
            )}

            {/* Add Table Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Table</h3>
                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-md p-3">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleAddTable}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Table Number
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newTable.tableNumber}
                                        onChange={(e) => setNewTable(prev => ({
                                            ...prev,
                                            tableNumber: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newTable.capacity}
                                        onChange={(e) => setNewTable(prev => ({
                                            ...prev,
                                            capacity: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : 'Add Table'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}            {/* Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map((table) => (
                    <div
                        key={table._id}
                        onClick={() => handleTableClick(table.tableNumber)}
                        className={`
                            p-6 rounded-xl border cursor-pointer transform transition-all duration-200
                            hover:scale-105 hover:shadow-lg
                            ${table.status === 'engaged' 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-white border-gray-200 hover:border-indigo-300'
                            }
                        `}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Table {table.tableNumber}</h3>
                                <p className={`text-sm mt-1 capitalize ${
                                    table.status === 'engaged' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {table.status}
                                </p>
                                <p className="text-sm text-gray-500">Capacity: {table.capacity}</p>
                            </div>
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center
                                ${table.status === 'engaged' 
                                    ? 'bg-red-100 text-red-600' 
                                    : 'bg-indigo-100 text-indigo-600'
                                }
                            `}>
                                {table.status === 'engaged' ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3h10l3 3V10a8 8 0 0 0-8-8z" />
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* Show current order if table is engaged */}
                        {table.currentOrder && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Order Status:</span>
                                    <span className="capitalize">{table.status}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                  {tables.length === 0 && !isLoading && (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                        No tables found. Click "Add Table" to create one.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TablesLayout;
