'use client';

import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <div>
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                                Something went wrong
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                        </div>
                        <div className="mt-5 text-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
