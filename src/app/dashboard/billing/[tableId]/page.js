import { Suspense } from 'react';
import TableBillingClient from './TableBillingClient';

// Server Component
export default async function TableBillingPage({ params }) {
    // Await params to resolve
    const tableId = await Promise.resolve(params).then(p => p.tableId);

    // Simple validation
    if (!tableId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600">Invalid table ID</div>
            </div>
        );
    }

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Loading table {tableId}...</div>
            </div>
        }>
            <TableBillingClient tableId={tableId} initialData={{}} />
        </Suspense>
    );
}
