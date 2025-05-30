'use client';
import { useState } from 'react';
import { Tab } from '@headlessui/react';


function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function ReportPage() {
    const [categories] = useState({
        Products: [
            {
                id: 1,
                title: 'Total Products',
                value: '156',
                growth: '+12%',
            },
            {
                id: 2,
                title: 'Out of Stock',
                value: '8',
                growth: '-2%',
            },
            // Add more product stats as needed
        ],
        Sales: [
            {
                id: 1,
                title: 'Total Revenue',
                value: '$24,560',
                growth: '+15%',
            },
            {
                id: 2,
                title: 'Orders',
                value: '450',
                growth: '+8%',
            },
            // Add more sales stats as needed
        ],
    });

    const categoryKeys = Object.keys(categories);
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
                <p className="text-gray-600 mt-1">Monitor your business performance and trends</p>
            </div>

            <div className="space-y-6">
                <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <Tab.List className="flex space-x-2 rounded-xl bg-white p-1 shadow-sm border">
                        {categoryKeys.map((category) => (
                            <Tab
                                key={category}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                                        'focus:outline-none',
                                        selected
                                            ? 'bg-indigo-600 text-white shadow'
                                            : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                                    )
                                }
                            >
                                {category}
                            </Tab>
                        ))}
                    </Tab.List>

                    <div className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {categories[categoryKeys[selectedIndex]].map((stat) => (
                                <div
                                    key={stat.id}
                                    className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <h3 className="text-sm font-medium text-gray-500">
                                        {stat.title}
                                    </h3>
                                    <div className="mt-2 flex items-baseline">
                                        <p className="text-3xl font-semibold text-gray-900">
                                            {stat.value}
                                        </p>
                                        <span className={`ml-2 text-sm flex items-center ${
                                            stat.growth.startsWith('+') 
                                                ? 'text-green-600' 
                                                : 'text-red-600'
                                        }`}>
                                            {stat.growth.startsWith('+') ? (
                                                <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                                                </svg>
                                            )}
                                            {stat.growth}
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    stat.growth.startsWith('+') 
                                                        ? 'bg-green-500' 
                                                        : 'bg-red-500'
                                                }`}
                                                style={{ width: `${Math.abs(parseInt(stat.growth))}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Tab.Group>

                {/* Additional Statistics */}
                <div className="bg-white rounded-xl border p-6 shadow-sm mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-indigo-50 rounded-lg">
                            <div className="text-sm text-indigo-600 font-medium">Today's Sales</div>
                            <div className="text-2xl font-semibold text-indigo-900 mt-1">₹12,426</div>
                            <div className="text-xs text-indigo-600 mt-2">+15.3% from yesterday</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-sm text-green-600 font-medium">Monthly Revenue</div>
                            <div className="text-2xl font-semibold text-green-900 mt-1">₹156,242</div>
                            <div className="text-xs text-green-600 mt-2">+8.2% from last month</div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-600 font-medium">Average Order</div>
                            <div className="text-2xl font-semibold text-blue-900 mt-1">₹285</div>
                            <div className="text-xs text-blue-600 mt-2">+2.4% from last week</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <div className="text-sm text-purple-600 font-medium">Total Orders</div>
                            <div className="text-2xl font-semibold text-purple-900 mt-1">548</div>
                            <div className="text-xs text-purple-600 mt-2">+12.6% from last week</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}