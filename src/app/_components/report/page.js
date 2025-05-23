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
        <div className="w-full px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                        {categoryKeys.map((category) => (
                            <Tab
                                key={category}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                        'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                        selected
                                            ? 'bg-white text-blue-700 shadow'
                                            : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                                    )
                                }
                            >
                                {category}
                            </Tab>
                        ))}
                    </Tab.List>
                </Tab.Group>
                {/* Render the selected tab's content manually */}
                <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {categories[categoryKeys[selectedIndex]].map((post) => (
                            <div
                                key={post.id}
                                className="relative rounded-lg p-6 border"
                            >
                                <h3 className="text-sm font-medium leading-5 text-gray-500">
                                    {post.title}
                                </h3>
                                <div className="mt-2 flex items-baseline">
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {post.value}
                                    </p>
                                    <span className={`ml-2 text-sm ${
                                        post.growth.startsWith('+') 
                                            ? 'text-green-500' 
                                            : 'text-red-500'
                                    }`}>
                                        {post.growth}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}