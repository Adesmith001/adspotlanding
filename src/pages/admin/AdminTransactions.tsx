import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdPayment, MdSearch } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import { getAdminTransactions } from '@/services/admin.service';
import { ensureAdminPayoutReminders, getDuePayouts, markPayoutCompleted } from '@/services/payout.service';
import type { Payout } from '@/types/billboard.types';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

const AdminTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [duePayouts, setDuePayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                await ensureAdminPayoutReminders();
                const [data, payouts] = await Promise.all([
                    getAdminTransactions(100),
                    getDuePayouts(25),
                ]);
                setTransactions(data);
                setDuePayouts(payouts);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                toast.error('Failed to load transactions');
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const handleMarkPayoutSent = async (payoutId: string) => {
        try {
            await markPayoutCompleted(payoutId);
            setDuePayouts(prev => prev.filter((payout) => payout.id !== payoutId));
            toast.success('Payout marked as sent');
        } catch (error) {
            console.error('Error completing payout:', error);
            toast.error('Failed to update payout');
        }
    };

    const filtered = transactions.filter((t) =>
        (t.billboardTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.reference || '').toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            paid: 'bg-green-100 text-green-700',
            pending: 'bg-amber-100 text-amber-700',
            failed: 'bg-red-100 text-red-700',
            refunded: 'bg-primary-100 text-primary-700',
        };
        return styles[status] || 'bg-neutral-100 text-neutral-700';
    };

    if (loading) {
        return (
            <DashboardLayout userRole="admin" title="Transactions" subtitle="Monitor all platform payment activity">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6"><div className="h-12 bg-neutral-200 rounded" /></Card>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userRole="admin" title="Transactions" subtitle="Monitor all platform payment activity">
            <div className="space-y-6">
                <Card className="p-5">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900">Monday Payout Queue</h3>
                            <p className="text-sm text-neutral-500">Admin collects advertiser payments and disburses owner payouts every Monday.</p>
                        </div>
                        <span className="rounded-full bg-[#d4f34a]/30 px-3 py-1 text-xs font-semibold text-green-800">
                            {duePayouts.length} due
                        </span>
                    </div>

                    {duePayouts.length === 0 ? (
                        <p className="text-sm text-neutral-500">No owner payouts are waiting for disbursement.</p>
                    ) : (
                        <div className="space-y-3">
                            {duePayouts.map((payout) => (
                                <div key={payout.id} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="font-semibold text-neutral-900">{payout.ownerName}</p>
                                        <p className="text-sm text-neutral-500">
                                            {formatPrice(payout.amount)} due on {payout.payoutDate.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'short' })}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            {payout.paymentCount} payment{payout.paymentCount === 1 ? '' : 's'} bundled into this payout
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold capitalize text-neutral-700">
                                            {payout.status}
                                        </span>
                                        <Button size="sm" onClick={() => handleMarkPayoutSent(payout.id)}>
                                            Mark Sent
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Search */}
                <Card className="p-4">
                    <div className="relative">
                        <MdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by billboard or reference..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                </Card>

                {/* Transactions Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px]">
                            <thead>
                                <tr className="border-b border-neutral-200">
                                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-neutral-500">Date</th>
                                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-neutral-500">Billboard</th>
                                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-neutral-500">Reference</th>
                                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-neutral-500">Status</th>
                                    <th className="text-right py-4 px-4 sm:px-6 text-sm font-medium text-neutral-500">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((tx) => (
                                    <motion.tr
                                        key={tx.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                                    >
                                        <td className="py-4 px-4 sm:px-6 text-sm text-neutral-500 whitespace-nowrap">
                                            {tx.createdAt instanceof Date ? tx.createdAt.toLocaleDateString() : new Date(tx.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4 sm:px-6 text-sm font-medium text-neutral-900">
                                            {tx.billboardTitle || '-'}
                                        </td>
                                        <td className="py-4 px-4 sm:px-6 text-neutral-500 font-mono text-xs whitespace-nowrap">
                                            {tx.reference || '-'}
                                        </td>
                                        <td className="py-4 px-4 sm:px-6">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(tx.status)}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 sm:px-6 text-sm font-bold text-neutral-900 text-right whitespace-nowrap">
                                            {formatPrice(tx.amount || 0)}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="text-center py-12">
                                <MdPayment size={48} className="text-neutral-300 mx-auto mb-4" />
                                <p className="text-neutral-500">No transactions found</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminTransactions;
