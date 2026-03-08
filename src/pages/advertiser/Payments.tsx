import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdCreditCard, MdShield, MdCheckCircle, MdPending, MdError, MdReceipt } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { getPaymentHistory, PaymentTransaction } from '@/services/payment.service';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'paid': return <MdCheckCircle size={18} className="text-green-500" />;
        case 'pending': return <MdPending size={18} className="text-amber-500" />;
        case 'failed': return <MdError size={18} className="text-red-500" />;
        default: return <MdCreditCard size={18} className="text-neutral-400" />;
    }
};

const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

const Payments: React.FC = () => {
    const user = useAppSelector(selectUser);

    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            try {
                const fetchedTxns = await getPaymentHistory(user.uid, 'advertiser');
                setTransactions(fetchedTxns);
            } catch (err) {
                console.error('Error loading payment history:', err);
                toast.error('Failed to load payment history');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    return (
        <DashboardLayout
            userRole="advertiser"
            title="Payments"
            subtitle="View your payment and billing history"
        >
            {/* Korapay Security Notice */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl flex gap-4"
            >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MdShield className="text-blue-600" size={20} />
                </div>
                <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-1">Secure Payments via Korapay</p>
                    <p className="text-blue-700 leading-relaxed">
                        All payments are processed securely through Korapay. Your card information is encrypted and never stored on our servers. Click <strong>Book Now</strong> on any billboard listing to initiate a payment.
                    </p>
                </div>
            </motion.div>

            {/* Transaction History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <Card>
                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                                <MdReceipt size={20} className="text-neutral-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900">Billing History</h2>
                                <p className="text-sm text-neutral-500">All your payment transactions</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-14 rounded-xl bg-neutral-100 animate-pulse" />
                                ))}
                            </div>
                        ) : transactions.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="text-center py-16"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MdCreditCard size={36} className="text-neutral-400" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                                    No transaction history yet
                                </h3>
                                <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                                    Your payment transactions will appear here once you book your first billboard.
                                </p>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Link to="/listings">
                                        <Button>Browse Billboards</Button>
                                    </Link>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-neutral-200">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Date</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Description</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Reference</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Status</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-neutral-500">Amount</th>
                                        </tr>
                                    </thead>
                                    <motion.tbody
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {transactions.map((txn) => (
                                            <motion.tr
                                                key={txn.id}
                                                variants={itemVariants}
                                                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                                            >
                                                <td className="py-3 px-4 text-sm text-neutral-600 whitespace-nowrap">
                                                    {new Date(txn.createdAt).toLocaleDateString('en-NG', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-medium text-neutral-900">
                                                    {txn.billboardTitle}
                                                </td>
                                                <td className="py-3 px-4 text-xs text-neutral-500 font-mono">
                                                    {txn.reference || '—'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${txn.status === 'paid'
                                                            ? 'bg-green-100 text-green-700'
                                                            : txn.status === 'pending'
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {getStatusIcon(txn.status)}
                                                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm font-bold text-neutral-900 text-right">
                                                    {formatPrice(txn.amount)}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </motion.tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </DashboardLayout>
    );
};

export default Payments;
