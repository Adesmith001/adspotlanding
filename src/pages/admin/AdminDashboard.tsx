import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdPeople, MdAdminPanelSettings, MdAttachMoney, MdVerifiedUser, MdTrendingUp, MdDashboard } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import { getAdminStats } from '@/services/admin.service';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <DashboardLayout userRole="admin" title="Admin Dashboard" subtitle="System overview and management">
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-6"><div className="h-20 bg-neutral-200 rounded" /></Card>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    const cards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, sub: `${stats?.owners || 0} owners • ${stats?.advertisers || 0} advertisers`, icon: <MdPeople size={24} />, bg: 'bg-blue-50', color: 'text-blue-600' },
        { label: 'Total Billboards', value: stats?.totalBillboards || 0, sub: `${stats?.activeBillboards || 0} active • ${stats?.pendingBillboards || 0} pending`, icon: <MdDashboard size={24} />, bg: 'bg-green-50', color: 'text-green-600' },
        { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), sub: 'All-time platform revenue', icon: <MdAttachMoney size={24} />, bg: 'bg-amber-50', color: 'text-amber-600' },
        { label: 'Transactions', value: stats?.totalTransactions || 0, sub: 'Total processed payments', icon: <MdTrendingUp size={24} />, bg: 'bg-purple-50', color: 'text-purple-600' },
    ];

    return (
        <DashboardLayout userRole="admin" title="Admin Dashboard" subtitle="System overview and management">
            <div className="space-y-8">
                {/* Stats Grid */}
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, i) => (
                        <motion.div key={i} variants={itemVariants}>
                            <Card className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center`}>
                                        <span className={card.color}>{card.icon}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-500">{card.label}</p>
                                <p className="text-2xl font-bold text-neutral-900 mt-1">{card.value}</p>
                                <p className="text-xs text-neutral-400 mt-1">{card.sub}</p>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-neutral-900 mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a href="/dashboard/admin/users" className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <MdPeople size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900">User Management</p>
                                    <p className="text-xs text-neutral-500">View and manage user accounts</p>
                                </div>
                            </a>
                            <a href="/dashboard/admin/listings" className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <MdVerifiedUser size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900">Verify Listings</p>
                                    <p className="text-xs text-neutral-500">Approve or reject pending billboards</p>
                                </div>
                            </a>
                            <a href="/dashboard/admin/transactions" className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-colors">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <MdAdminPanelSettings size={24} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900">Transactions</p>
                                    <p className="text-xs text-neutral-500">Monitor platform payments</p>
                                </div>
                            </a>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
