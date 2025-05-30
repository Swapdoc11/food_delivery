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
                return <div>Select a menu from the sidebar.</div>;
        }
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            {/* Mobile sidebar overlay */}
            <div
                className={`fixed inset-0 z-30 bg-black bg-opacity-40 transition-opacity md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
                onClick={() => setSidebarOpen(false)}
            />
            <aside
                className={`
                    fixed z-40 inset-y-0 left-0 bg-white shadow-lg transition-all duration-300
                    flex flex-col
                    w-64
                    transform
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:static md:translate-x-0 md:w-64
                    ${sidebarOpen ? '' : 'md:w-20'}
                `}
                style={{ height: '100vh' }}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b">
                    <span className="text-xl font-bold text-indigo-600 transition-all duration-300">{sidebarOpen ? 'Food Delivery' : 'FD'}</span>
                    <button
                        className="md:hidden text-gray-500"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle Sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
                <nav className="flex-1 py-6 px-2 space-y-2">
                    <SidebarLink icon="🍔" label="Add Product" sidebarOpen={sidebarOpen} selected={selectedMenu} onClick={setSelectedMenu} />
                    <SidebarLink icon="✏️" label="Edit Product" sidebarOpen={sidebarOpen} selected={selectedMenu} onClick={setSelectedMenu} />
                    <SidebarLink icon="📊" label="Report" sidebarOpen={sidebarOpen} selected={selectedMenu} onClick={setSelectedMenu} />
                    <SidebarLink icon="💳" label="Billing" sidebarOpen={sidebarOpen} selected={selectedMenu} onClick={setSelectedMenu} />
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-0" style={{ minHeight: 0 }}>
                {/* Header */}
                <header className="flex items-center justify-between bg-white h-16 px-4 md:px-6 shadow w-full">
                    {/* Sidebar toggle for mobile */}
                    <button
                        className="md:hidden mr-2 text-gray-500"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Open Sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="text-xl md:text-2xl font-semibold text-gray-700">Dashboard</div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* Settings */}
                        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        {/* Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition"
                                onClick={() => setDropdownOpen((open) => !open)}
                            >
                                <img
                                    src="https://randomuser.me/api/portraits/men/32.jpg"
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="hidden md:block font-medium text-gray-700">Admin</span>
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {/* Dropdown */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-10">
                                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</a>
                                    <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Settings</a>
                                    <button 
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                {/* Content */}
                <main className="flex-1 p-2 sm:p-4 md:p-8 overflow-y-hidden">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

function SidebarLink({ icon, label, sidebarOpen, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={() => onClick(label)}
            className={`flex items-center w-full px-2 md:px-4 py-2 md:py-3 rounded-lg text-gray-700 hover:bg-indigo-50 transition font-medium
                ${selected === label ? 'bg-indigo-100 text-indigo-700' : ''}`}
            style={{ outline: 'none', border: 'none', background: 'none' }}
        >
            <span className="text-xl mr-2 md:mr-3">{icon}</span>
            {sidebarOpen && <span className="text-sm md:text-base">{label}</span>}
        </button>
    );
}
