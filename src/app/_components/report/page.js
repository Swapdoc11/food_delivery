'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useBilling } from '@/hooks/useBilling';
import LoadingSpinner from '@/components/LoadingSpinner';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function ReportPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const { loading, error, getRevenueStats } = useBilling();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getRevenueStats(selectedPeriod);
                setStats(data);
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };

        fetchStats();
    }, [selectedPeriod, getRevenueStats]);

    if (loading) {
        return <LoadingSpinner message="Loading revenue data..." />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Revenue Reports</h2>
                <p className="text-gray-600 mt-1">Track your restaurant&apos;s performance</p>
            </div>

            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-indigo-100 p-1">
                    <Tab
                        className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                            ${selected
                                ? 'bg-white text-indigo-700 shadow'
                                : 'text-indigo-600 hover:bg-white/[0.12] hover:text-indigo-700'
                            }`
                        }
                        onClick={() => setSelectedPeriod('today')}
                    >
                        Today
                    </Tab>
                    <Tab
                        className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                            ${selected
                                ? 'bg-white text-indigo-700 shadow'
                                : 'text-indigo-600 hover:bg-white/[0.12] hover:text-indigo-700'
                            }`
                        }
                        onClick={() => setSelectedPeriod('week')}
                    >
                        This Week
                    </Tab>
                    <Tab
                        className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                            ${selected
                                ? 'bg-white text-indigo-700 shadow'
                                : 'text-indigo-600 hover:bg-white/[0.12] hover:text-indigo-700'
                            }`
                        }
                        onClick={() => setSelectedPeriod('month')}
                    >
                        This Month
                    </Tab>
                </Tab.List>

                <Tab.Panels className="mt-2">
                    <Tab.Panel>
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">                                <div className="p-4 bg-indigo-50 rounded-lg">
                                    <div className="text-sm text-indigo-600 font-medium">Today&apos;s Sales</div>
                                    <div className="text-2xl font-semibold text-indigo-900 mt-1">
                                        ₹{(stats?.totalRevenue || 0).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-indigo-600 mt-2">
                                        {stats?.totalOrders || 0} orders today
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="text-sm text-green-600 font-medium">Average Order Value</div>
                                    <div className="text-2xl font-semibold text-green-900 mt-1">
                                        ₹{(stats?.averageOrderValue || 0).toFixed(2)}
                                    </div>
                                </div>                                {stats?.topItems?.length > 0 && (
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-sm text-blue-600 font-medium">Top Selling Item</div>
                                        <div className="text-2xl font-semibold text-blue-900 mt-1">
                                            {stats.topItems[0]?.name || 'N/A'}
                                        </div>
                                        <div className="text-xs text-blue-600 mt-2">
                                            {stats.topItems[0]?.totalQuantity || 0} units sold
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Tab.Panel>
                    {/* Similar panels for Week and Month views */}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}