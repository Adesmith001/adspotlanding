import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCreditCard, MdAdd, MdDelete, MdShield } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface PaymentCard {
    id: string;
    last4: string;
    brand: string;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const Payments: React.FC = () => {
    const [cards, setCards] = useState<PaymentCard[]>([
        {
            id: '1',
            last4: '5678',
            brand: 'Mastercard',
            expiryMonth: '12',
            expiryYear: '26',
            isDefault: true,
        },
    ]);
    const [showAddCard, setShowAddCard] = useState(false);
    const [transactions] = useState<any[]>([]);

    const handleAddCard = () => {
        toast.error('Korapay integration coming soon!');
        setShowAddCard(false);
    };

    const handleRemoveCard = (cardId: string) => {
        if (cards.length === 1) {
            toast.error('You must have at least one payment method');
            return;
        }
        setCards(cards.filter(c => c.id !== cardId));
        toast.success('Card removed successfully');
    };

    const handleSetDefault = (cardId: string) => {
        setCards(cards.map(c => ({
            ...c,
            isDefault: c.id === cardId,
        })));
        toast.success('Default payment method updated');
    };

    return (
        <DashboardLayout
            userRole="advertiser"
            title="Payments"
            subtitle="Manage your payment methods and transaction history"
        >
            {/* Payment Methods Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="mb-8">
                    <div className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900">Payment Methods</h2>
                                <p className="text-sm text-neutral-500 mt-1">
                                    Add and manage your payment cards
                                </p>
                            </div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={() => setShowAddCard(true)}
                                    icon={<MdAdd />}
                                >
                                    Add Payment Method
                                </Button>
                            </motion.div>
                        </div>

                        {/* Cards List */}
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
                                    className="flex items-center justify-between p-5 border border-neutral-200 rounded-2xl hover:border-primary-300 hover:shadow-soft transition-all duration-200"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-10 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center shadow-md">
                                            <MdCreditCard className="text-white" size={22} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-neutral-900">
                                                    {card.brand}
                                                </p>
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

                                    <div className="flex items-center gap-2">
                                        {!card.isDefault && (
                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSetDefault(card.id)}
                                                >
                                                    Set as Default
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

                        {/* Info Box */}
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

            {/* Transaction History Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <Card>
                    <div className="p-6 md:p-8">
                        <h2 className="text-xl font-bold text-neutral-900 mb-2">Billing History</h2>
                        <p className="text-sm text-neutral-500 mb-6">
                            View your payment transactions
                        </p>

                        {transactions.length === 0 ? (
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
                                    No transaction history available yet
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
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-neutral-200">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Date</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Description</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Reference</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-neutral-500">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction: any) => (
                                            <motion.tr
                                                key={transaction.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                                            >
                                                <td className="py-3 px-4 text-sm text-neutral-900">{transaction.date}</td>
                                                <td className="py-3 px-4 text-sm text-neutral-900 font-medium">{transaction.description}</td>
                                                <td className="py-3 px-4 text-sm text-neutral-500 font-mono">{transaction.reference}</td>
                                                <td className="py-3 px-4 text-sm text-neutral-900 text-right font-bold">{transaction.amount}</td>
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
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <MdCreditCard size={28} className="text-primary-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-2 text-center">
                                        Add Payment Method
                                    </h3>
                                    <p className="text-neutral-500 mb-8 text-center text-sm">
                                        Korapay integration will be added here to securely collect your card details.
                                    </p>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowAddCard(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleAddCard}
                                            className="flex-1"
                                        >
                                            Continue
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
