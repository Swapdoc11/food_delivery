import { Suspense } from 'react';
import TableBillingClient from '../../dashboard/billing/[tableId]/TableBillingClient';

// Server Component
export default async function TableBillingPage({ params }) {
    // Ensure params is resolved before using
    const tableId = await Promise.resolve(params).then(p => p.tableId);

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Loading table {tableId}...</div>
            </div>
        }>
            <TableBillingClient tableId={tableId} />
        </Suspense>
    );
}
