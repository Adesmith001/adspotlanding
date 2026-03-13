import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MdPeople,
    MdAdminPanelSettings,
    MdAttachMoney,
    MdVerifiedUser,
    MdTrendingUp,
    MdDashboard,
    MdFlag,
    MdArrowForward,
    MdMoreHoriz,
} from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import { getAdminStats, getAllReports, type Report } from '@/services/admin.service';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

const reportStatusStyle: Record<string, string> = {
    open: 'bg-red-50 text-red-700',
    reviewed: 'bg-amber-50 text-amber-700',
    resolved: 'bg-[#d4f34a]/30 text-green-800',
};

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [data, reportData] = await Promise.all([getAdminStats(), getAllReports()]);
                setStats(data);
                setReports(reportData);
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
            <DashboardLayout userRole="admin" title="Admin Dashboard" subtitle="Platform overview and management">
                <div className="animate-pulse space-y-5">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="bg-white rounded-2xl h-28" />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 bg-white rounded-2xl h-80" />
                        <div className="bg-white rounded-2xl h-80" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const statCards = [
        {
            label: 'Total Users',
            value: stats?.totalUsers || 0,
            sub: `${stats?.owners || 0} owners · ${stats?.advertisers || 0} advertisers`,
            icon: <MdPeople size={20} />,
            iconBg: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Total Billboards',
            value: stats?.totalBillboards || 0,
            sub: `${stats?.activeBillboards || 0} active · ${stats?.pendingBillboards || 0} pending`,
            icon: <MdDashboard size={20} />,
            iconBg: 'bg-[#d4f34a]/30 text-green-700',
        },
        {
            label: 'Total Revenue',
            value: formatPrice(stats?.totalRevenue || 0),
            sub: 'All-time platform revenue',
            icon: <MdAttachMoney size={20} />,
            iconBg: 'bg-amber-50 text-amber-600',
        },
        {
            label: 'Transactions',
            value: stats?.totalTransactions || 0,
            sub: 'Total processed payments',
            icon: <MdTrendingUp size={20} />,
            iconBg: 'bg-purple-50 text-purple-600',
        },
    ];

    const openReports = reports.filter(r => r.status === 'open').length;

    return (
        <DashboardLayout userRole="admin" title="Admin Dashboard" subtitle="Platform overview and management">
            <div className="space-y-5">
                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {statCards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                                    {card.icon}
                                </div>
                                <button className="text-neutral-300 hover:text-neutral-500"><MdMoreHoriz size={18} /></button>
                            </div>
                            <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
                            <p className="text-xs text-neutral-400 mt-1">{card.label}</p>
                            <p className="text-[10px] text-neutral-300 mt-0.5">{card.sub}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Reports panel — 2 cols */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-50">
                            <div>
                                <h3 className="font-semibold text-neutral-900 text-sm">Recent Reports</h3>
                                <p className="text-xs text-neutral-400 mt-0.5">{reports.length} total · {openReports} open</p>
                            </div>
                            {openReports > 0 && (
                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    {openReports} open
                                </span>
                            )}
                        </div>

                        {reports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                                <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mb-3">
                                    <MdFlag size={24} className="text-neutral-400" />
                                </div>
                                <p className="font-medium text-neutral-700">No reports yet</p>
                                <p className="text-sm text-neutral-400 mt-1">User reports will show up here</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-50">
                                {reports.slice(0, 5).map((report, i) => (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 + i * 0.04 }}
                                        className="flex items-start gap-4 px-6 py-4 hover:bg-neutral-50/50 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                            <MdFlag size={16} className="text-red-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-900 truncate">{report.subject}</p>
                                            <p className="text-xs text-neutral-400 truncate mt-0.5">
                                                {report.reporterName} · {report.billboardTitle || 'General'}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{report.description}</p>
                                        </div>
                                        <div className="flex-shrink-0 text-right">
                                            <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full ${reportStatusStyle[report.status] || 'bg-neutral-100 text-neutral-600'}`}>
                                                {report.status}
                                            </span>
                                            <p className="text-[10px] text-neutral-300 mt-1">
                                                {new Date(report.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Right panel */}
                    <div className="space-y-4">
                        {/* Platform health card */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18 }}
                            className="bg-neutral-900 rounded-2xl p-5 text-white"
                        >
                            <p className="text-xs text-white/50 mb-1">Platform Revenue</p>
                            <p className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</p>
                            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] text-white/40">Billboards</p>
                                    <p className="text-base font-semibold text-[#d4f34a]">{stats?.totalBillboards || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40">Users</p>
                                    <p className="text-base font-semibold text-white/70">{stats?.totalUsers || 0}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.22 }}
                            className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
                        >
                            <p className="px-5 pt-4 pb-3 text-xs font-semibold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">
                                Quick Actions
                            </p>
                            {[
                                { label: 'User Management', href: '/dashboard/admin/users', icon: <MdPeople size={16} /> },
                                { label: 'Verify Listings', href: '/dashboard/admin/listings', icon: <MdVerifiedUser size={16} /> },
                                { label: 'Transactions', href: '/dashboard/admin/transactions', icon: <MdAttachMoney size={16} /> },
                                { label: 'Admin Settings', href: '/dashboard/admin/settings', icon: <MdAdminPanelSettings size={16} /> },
                            ].map((action) => (
                                <Link
                                    key={action.href}
                                    to={action.href}
                                    className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-neutral-400">{action.icon}</span>
                                        <span className="text-sm font-medium text-neutral-700">{action.label}</span>
                                    </div>
                                    <MdArrowForward size={14} className="text-neutral-300" />
                                </Link>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Platform quick-access cards */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    {[
                        { label: 'User Management', sub: 'View and manage accounts', icon: <MdPeople size={22} />, href: '/dashboard/admin/users', bg: 'bg-blue-50/70', iconColor: 'text-blue-600' },
                        { label: 'Verify Listings', sub: 'Approve or reject billboards', icon: <MdVerifiedUser size={22} />, href: '/dashboard/admin/listings', bg: 'bg-[#d4f34a]/20', iconColor: 'text-green-700' },
                        { label: 'Transactions', sub: 'Monitor platform payments', icon: <MdAttachMoney size={22} />, href: '/dashboard/admin/transactions', bg: 'bg-purple-50/70', iconColor: 'text-purple-600' },
                    ].map((card, i) => (
                        <Link
                            key={i}
                            to={card.href}
                            className={`${card.bg} rounded-2xl p-5 flex items-center gap-4 hover:opacity-90 transition-opacity`}
                        >
                            <div className={`w-11 h-11 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${card.iconColor}`}>
                                {card.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-neutral-900 text-sm">{card.label}</p>
                                <p className="text-xs text-neutral-500 mt-0.5">{card.sub}</p>
                            </div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
