import { Suspense } from 'react';
import TableBillingClient from './TableBillingClient';

// Server Component
export default async function TableBillingPage({ params }) {
    // Simple validation
    if (!params?.tableId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600">Invalid table ID</div>
            </div>
        );
    }

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Loading table...</div>
            </div>
        }>
            <TableBillingClient tableId={params.tableId} initialData={{}} />
        </Suspense>
    );
}
