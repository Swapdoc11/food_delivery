'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

const TablesLayout = () => {
    const router = useRouter();
    // Get tables state from Redux store
    const tablesState = useSelector(state => state.table.tables);
    
    // You can modify the number of tables as needed
    const [tables] = useState([
        { id: 1, name: 'Table 1', status: 'available', orders: [] },
        { id: 2, name: 'Table 2', status: 'available', orders: [] },
        { id: 3, name: 'Table 3', status: 'available', orders: [] },
        { id: 4, name: 'Table 4', status: 'available', orders: [] },
        { id: 5, name: 'Table 5', status: 'available', orders: [] },
        { id: 6, name: 'Table 6', status: 'available', orders: [] },
        { id: 7, name: 'Table 7', status: 'available', orders: [] },
        { id: 8, name: 'Table 8', status: 'available', orders: [] },
        { id: 9, name: 'Table 9', status: 'available', orders: [] },
    ]);

    // Get table status based on whether it has orders
    const getTableStatus = (tableId) => {
        const tableOrders = tablesState[tableId] || [];
        return tableOrders.length > 0 ? 'occupied' : 'available';
    };

    const handleTableClick = (tableId) => {
        router.push(`/dashboard/billing/${tableId}`);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Restaurant Tables</h2>
                <p className="text-gray-600 mt-1">Select a table to manage orders</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        onClick={() => handleTableClick(table.id)}
                        className={`
                            p-6 rounded-xl border cursor-pointer transform transition-all duration-200
                            hover:scale-105 hover:shadow-lg
                            ${table.status === 'occupied' 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-white border-gray-200 hover:border-indigo-300'
                            }
                        `}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{table.name}</h3>
                                <p className={`text-sm mt-1 capitalize ${
                                    table.status === 'occupied' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {table.status}
                                </p>
                            </div>
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center
                                ${table.status === 'occupied' 
                                    ? 'bg-red-100 text-red-600' 
                                    : 'bg-indigo-100 text-indigo-600'
                                }
                            `}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3h10l3 3V10a8 8 0 0 0-8-8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TablesLayout;
