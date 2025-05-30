'use client';

import { useState, useRef, useEffect } from 'react';
import AddProductForm from '../_components/add_product/page';
import Link from 'next/link';
import ProductTable from '../_components/edit_product/page';
import ReportPage from '../_components/report/page';
import BillingPage from '../_components/billing_page/page';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/slices/authSlice';

export default function DashboardPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedMenu, setSelectedMenu] = useState('Add Product');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const dispatch = useDispatch();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    // Render content based on selected menu
    function renderContent() {
        switch (selectedMenu) {
            case 'Add Product':
                return <AddProductForm />;
            case 'Edit Product':
                return <ProductTable />;
            case 'Report':
                return <ReportPage />;
            case 'Billing':
                return <BillingPage />;
            default:
                return <div>Select a menu item</div>;
        }
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-white to-pink-50 overflow-hidden">
            {/* Sidebar Overlay */}
            <div
                className={`fixed inset-0 z-20 bg-gray-900/50 lg:hidden ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out h-screen
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}
            >
                {/* Sidebar Header - Fixed */}
                <div className="flex-shrink-0 h-16 flex items-center justify-between px-4 bg-gradient-to-r from-indigo-600 to-indigo-800">
                    <div className="flex items-center">
                        <span className="text-xl font-semibold text-white">Food Delivery</span>
                    </div>
                    <button
                        className="p-1 text-white hover:bg-indigo-700 rounded-md lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Sidebar Navigation - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <nav className="p-4 space-y-2">
                        <MenuButton
                            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>}
                            label="Add Product"
                            active={selectedMenu === 'Add Product'}
                            onClick={() => setSelectedMenu('Add Product')}
                        />
                        <MenuButton
                            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>}
                            label="Edit Product"
                            active={selectedMenu === 'Edit Product'}
                            onClick={() => setSelectedMenu('Edit Product')}
                        />
                        <MenuButton
                            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>}
                            label="Report"
                            active={selectedMenu === 'Report'}
                            onClick={() => setSelectedMenu('Report')}
                        />
                        <MenuButton
                            icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>}
                            label="Billing"
                            active={selectedMenu === 'Billing'}
                            onClick={() => setSelectedMenu('Billing')}
                        />
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Fixed Header */}
                <header className="flex-shrink-0 h-16 bg-white shadow-sm">
                    <div className="h-full px-4 flex items-center justify-between">
                        <button
                            className="p-2 rounded-md lg:hidden hover:bg-gray-100"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* User Dropdown */}
                        <div className="relative ml-auto" ref={dropdownRef}>
                            <button
                                className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">AD</span>
                                </div>
                                <span className="hidden md:inline text-gray-700">Admin</span>
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border">
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content - Scrollable */}
                <main className="flex-1 overflow-y-auto p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

function MenuButton({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                active
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            <span className={`${active ? 'text-indigo-600' : 'text-gray-500'}`}>{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    );
}
