'use client';

export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="flex items-center justify-center min-h-screen p-5">
            <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
}
