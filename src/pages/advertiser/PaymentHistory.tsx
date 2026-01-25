import React, { useState, useEffect } from 'react';
import { MdPayment, MdDownload, MdCheckCircle, MdPending, MdError } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { getPaymentHistory, PaymentTransaction } from '@/services/payment.service';
import toast from 'react-hot-toast';

const PaymentHistory: React.FC = () => {
    const user = useAppSelector(selectUser);
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            if (!user) return;
            try {
                const history = await getPaymentHistory(user.uid, 'advertiser');
                setPayments(history);
            } catch (error) {
                console.error("Error fetching payment history:", error);
                toast.error("Failed to load payment history");
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [user]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <MdCheckCircle size={20} className="text-green-500" />;
            case 'pending':
                return <MdPending size={20} className="text-amber-500" />;
            case 'failed':
                return <MdError size={20} className="text-red-500" />;
            default:
                return <MdPayment size={20} className="text-neutral-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, { text: string; className: string }> = {
            paid: { text: 'Paid', className: 'bg-green-100 text-green-700' },
            pending: { text: 'Pending', className: 'bg-amber-100 text-amber-700' },
            failed: { text: 'Failed', className: 'bg-red-100 text-red-700' },
        };
        return labels[status] || { text: status, className: 'bg-neutral-100 text-neutral-700' };
    };

    if (loading) {
        return (
            <DashboardLayout
                userRole="advertiser"
                title="Payment History"
                subtitle="View your payment transactions"
            >
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6">
                            <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4" />
                            <div className="h-4 bg-neutral-200 rounded w-1/2" />
                        </Card>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            userRole="advertiser"
            title="Payment History"
            subtitle="View your payment transactions"
        >
            {payments.length === 0 ? (
                <EmptyState
                    icon={<MdPayment />}
                    title="No Payment History"
                    description="Your payment transactions will appear here once you book your first billboard. All payments are secure and processed through Paystack."
                    actionLabel="Browse Billboards"
                    actionHref="/listings"
                />
            ) : (
                <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="p-6">
                            <p className="text-sm text-neutral-500 mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-neutral-900">
                                {formatPrice(payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0))}
                            </p>
                        </Card>
                        <Card className="p-6">
                            <p className="text-sm text-neutral-500 mb-1">This Month</p>
                            <p className="text-2xl font-bold text-neutral-900">
                                {formatPrice(
                                    payments
                                        .filter(p => {
                                            const today = new Date();
                                            const pDate = new Date(p.createdAt);
                                            return p.status === 'paid' &&
                                                pDate.getMonth() === today.getMonth() &&
                                                pDate.getFullYear() === today.getFullYear();
                                        })
                                        .reduce((acc, p) => acc + p.amount, 0)
                                )}
                            </p>
                        </Card>
                        <Card className="p-6">
                            <p className="text-sm text-neutral-500 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-amber-600">
                                {formatPrice(payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0))}
                            </p>
                        </Card>
                    </div>

                    {/* Payments Table */}
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Transaction</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Amount</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Status</th>
                                        <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Date</th>
                                        <th className="text-right px-6 py-4 text-sm font-medium text-neutral-700">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(payment.status)}
                                                    <div>
                                                        <p className="font-medium text-neutral-900">{payment.billboardTitle}</p>
                                                        <p className="text-xs text-neutral-500">{payment.reference || 'No ref'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-neutral-900">{formatPrice(payment.amount)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusLabel(payment.status).className}`}>
                                                    {getStatusLabel(payment.status).text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-neutral-600">
                                                {formatDate(payment.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {payment.status === 'paid' && (
                                                    <Button size="sm" variant="outline" icon={<MdDownload />}>
                                                        Receipt
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
};

export default PaymentHistory;
