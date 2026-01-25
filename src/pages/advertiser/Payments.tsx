import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdCreditCard, MdAdd, MdDelete, MdInfo } from 'react-icons/md';
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
        // TODO: Integrate Korapay for card addition
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
            <Card className="mb-6">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">Payment Methods</h2>
                            <p className="text-sm text-neutral-600 mt-1">
                                Add and manage your payment cards
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowAddCard(true)}
                            icon={<MdAdd />}
                        >
                            Add Payment Method
                        </Button>
                    </div>

                    {/* Cards List */}
                    <div className="space-y-4">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-500 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                                        <MdCreditCard className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-neutral-900">
                                                {card.brand}
                                            </p>
                                            {card.isDefault && (
                                                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-neutral-600">
                                            •••• •••• •••• {card.last4}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            Exp: {card.expiryMonth}/{card.expiryYear}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!card.isDefault && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSetDefault(card.id)}
                                        >
                                            Set as Default
                                        </Button>
                                    )}
                                    <button
                                        onClick={() => handleRemoveCard(card.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove card"
                                    >
                                        <MdDelete size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                        <MdInfo className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">Secure Payments</p>
                            <p className="text-blue-700">
                                All payments are processed securely through Korapay. Your card information is encrypted and never stored on our servers.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Transaction History Section */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Billing History</h2>
                    <p className="text-sm text-neutral-600 mb-6">
                        View your payment transactions
                    </p>

                    {transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MdCreditCard size={32} className="text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                No transaction history available yet
                            </h3>
                            <p className="text-neutral-600 mb-6">
                                Your payment transactions will appear here once you book your first billboard.
                            </p>
                            <Link to="/listings">
                                <Button>Browse Billboards</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                                            Date
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                                            Description
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                                            Reference
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-neutral-100">
                                            <td className="py-3 px-4 text-sm text-neutral-900">
                                                {transaction.date}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-neutral-900">
                                                {transaction.description}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-neutral-600">
                                                {transaction.reference}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-neutral-900 text-right font-semibold">
                                                {transaction.amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Add Card Modal */}
            {showAddCard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                Add Payment Method
                            </h3>
                            <p className="text-neutral-600 mb-6">
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
                </div>
            )}
        </DashboardLayout>
    );
};

export default Payments;
