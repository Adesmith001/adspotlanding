import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCreditCard, MdAdd, MdDelete, MdShield, MdCheckCircle, MdPending, MdError } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import {
    getSavedCards,
    addSavedCard,
    removeSavedCard,
    setDefaultCard,
    SavedCard,
} from '@/services/user.service';
import { getPaymentHistory, PaymentTransaction } from '@/services/payment.service';


const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const detectBrand = (number: string): string => {
    const n = number.replace(/\s/g, '');
    if (/^4/.test(n)) return 'Visa';
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
    if (/^3[47]/.test(n)) return 'Amex';
    if (/^6/.test(n)) return 'Verve';
    return 'Card';
};

const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
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

    const [cards, setCards] = useState<SavedCard[]>([]);
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Add card form state
    const [showAddCard, setShowAddCard] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [isAddingCard, setIsAddingCard] = useState(false);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            try {
                const [fetchedCards, fetchedTxns] = await Promise.all([
                    getSavedCards(user.uid),
                    getPaymentHistory(user.uid, 'advertiser'),
                ]);
                setCards(fetchedCards);
                setTransactions(fetchedTxns);
            } catch (err) {
                console.error('Error loading payment data:', err);
                toast.error('Failed to load payment data');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const handleAddCard = async () => {
        if (!user) return;
        const digits = cardNumber.replace(/\s/g, '');
        if (digits.length < 13 || digits.length > 19) {
            toast.error('Please enter a valid card number');
            return;
        }
        const month = parseInt(expiryMonth, 10);
        const year = parseInt(expiryYear, 10);
        if (!month || month < 1 || month > 12) {
            toast.error('Please enter a valid expiry month (01–12)');
            return;
        }
        if (!year || expiryYear.length < 2) {
            toast.error('Please enter a valid expiry year');
            return;
        }
        setIsAddingCard(true);
        try {
            const newCard: Omit<SavedCard, 'id' | 'createdAt'> = {
                last4: digits.slice(-4),
                brand: detectBrand(digits),
                expiryMonth: expiryMonth.padStart(2, '0'),
                expiryYear: expiryYear.length === 2 ? `20${expiryYear}` : expiryYear,
                isDefault: cards.length === 0,
            };
            const newId = await addSavedCard(user.uid, newCard);
            setCards(prev => {
                const updated = newCard.isDefault
                    ? prev.map(c => ({ ...c, isDefault: false }))
                    : prev;
                return [...updated, { id: newId, ...newCard }];
            });
            toast.success('Card added successfully');
            setShowAddCard(false);
            setCardNumber('');
            setExpiryMonth('');
            setExpiryYear('');
        } catch (err) {
            console.error('Error adding card:', err);
            toast.error('Failed to add card');
        } finally {
            setIsAddingCard(false);
        }
    };

    const handleRemoveCard = async (cardId: string) => {
        if (!user) return;
        if (cards.length === 1) {
            toast.error('You must have at least one payment method');
            return;
        }
        try {
            await removeSavedCard(user.uid, cardId);
            const remaining = cards.filter(c => c.id !== cardId);
            const removedCard = cards.find(c => c.id === cardId);
            if (removedCard?.isDefault && remaining.length > 0) {
                await setDefaultCard(user.uid, remaining[0].id);
                remaining[0] = { ...remaining[0], isDefault: true };
            }
            setCards(remaining);
            toast.success('Card removed');
        } catch (err) {
            console.error('Error removing card:', err);
            toast.error('Failed to remove card');
        }
    };

    const handleSetDefault = async (cardId: string) => {
        if (!user) return;
        try {
            await setDefaultCard(user.uid, cardId);
            setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === cardId })));
            toast.success('Default payment method updated');
        } catch (err) {
            console.error('Error setting default card:', err);
            toast.error('Failed to update default card');
        }
    };

    return (
        <DashboardLayout
            userRole="advertiser"
            title="Payments"
            subtitle="Manage your payment methods and transaction history"
        >
            {/* Payment Methods */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="mb-8">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900">Payment Methods</h2>
                                <p className="text-sm text-neutral-500 mt-1">Add and manage your payment cards</p>
                            </div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button onClick={() => setShowAddCard(true)} icon={<MdAdd />}>
                                    Add Payment Method
                                </Button>
                            </motion.div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-20 rounded-2xl bg-neutral-100 animate-pulse" />
                                ))}
                            </div>
                        ) : cards.length === 0 ? (
                            <div className="text-center py-10 text-neutral-500">
                                <MdCreditCard size={40} className="mx-auto mb-3 text-neutral-300" />
                                <p className="font-medium">No payment methods added yet</p>
                                <p className="text-sm mt-1">Add a card to get started</p>
                            </div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {cards.map((card) => (
                                    <motion.div
                                        key={card.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -2 }}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border border-neutral-200 rounded-2xl hover:border-primary-300 hover:shadow-soft transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-10 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center shadow-md">
                                                <MdCreditCard className="text-white" size={22} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-neutral-900">{card.brand}</p>
                                                    {card.isDefault && (
                                                        <motion.span
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ type: 'spring', stiffness: 300 }}
                                                            className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
                                                        >
                                                            Default
                                                        </motion.span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-neutral-600 font-mono">
                                                    •••• •••• •••• {card.last4}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    Exp: {card.expiryMonth}/{card.expiryYear}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                            {!card.isDefault && (
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSetDefault(card.id)}
                                                    >
                                                        Set Default
                                                    </Button>
                                                </motion.div>
                                            )}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleRemoveCard(card.id)}
                                                className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                title="Remove card"
                                            >
                                                <MdDelete size={20} />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl flex gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <MdShield className="text-blue-600" size={20} />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-blue-900 mb-1">Secure Payments</p>
                                <p className="text-blue-700 leading-relaxed">
                                    All payments are processed securely through Korapay. Your card information is encrypted and never stored on our servers.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </Card>
            </motion.div>

            {/* Transaction History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <Card>
                    <div className="p-6 md:p-8">
                        <h2 className="text-xl font-bold text-neutral-900 mb-2">Billing History</h2>
                        <p className="text-sm text-neutral-500 mb-6">View your payment transactions</p>

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
                                    <tbody>
                                        {transactions.map((txn) => (
                                            <motion.tr
                                                key={txn.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
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
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        txn.status === 'paid'
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
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* Add Card Modal */}
            <AnimatePresence>
                {showAddCard && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setShowAddCard(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
                        >
                            <Card className="max-w-md w-full pointer-events-auto shadow-2xl">
                                <div className="p-8">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                        <MdCreditCard size={26} className="text-primary-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-1 text-center">Add Card</h3>
                                    <p className="text-sm text-neutral-500 mb-6 text-center">
                                        Enter your card details to save for future payments
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                                Card Number
                                                {cardNumber && (
                                                    <span className="ml-2 text-primary-600 font-semibold">
                                                        — {detectBrand(cardNumber)}
                                                    </span>
                                                )}
                                            </label>
                                            <Input
                                                placeholder="0000 0000 0000 0000"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                maxLength={19}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                                    Expiry Month
                                                </label>
                                                <Input
                                                    placeholder="MM"
                                                    value={expiryMonth}
                                                    onChange={(e) =>
                                                        setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))
                                                    }
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                                    Expiry Year
                                                </label>
                                                <Input
                                                    placeholder="YY or YYYY"
                                                    value={expiryYear}
                                                    onChange={(e) =>
                                                        setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 4))
                                                    }
                                                    maxLength={4}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowAddCard(false);
                                                setCardNumber('');
                                                setExpiryMonth('');
                                                setExpiryYear('');
                                            }}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleAddCard}
                                            className="flex-1"
                                            disabled={isAddingCard}
                                        >
                                            {isAddingCard ? 'Saving...' : 'Save Card'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default Payments;
