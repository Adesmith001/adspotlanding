import React from 'react';
import { motion } from 'framer-motion';
import { MdAnalytics, MdTrendingUp, MdAttachMoney, MdVisibility, MdCalendarToday } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const tipVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, delay: 0.6 + i * 0.12 },
    }),
};

const statCards = [
    { label: 'Total Revenue', value: '₦0', sub: 'This month', icon: <MdAttachMoney size={24} />, bgColor: 'bg-green-50', iconColor: 'text-green-600', ringColor: 'from-green-400 to-emerald-500' },
    { label: 'Total Bookings', value: '0', sub: 'All time', icon: <MdCalendarToday size={24} />, bgColor: 'bg-blue-50', iconColor: 'text-blue-600', ringColor: 'from-blue-400 to-indigo-500' },
    { label: 'Utilization Rate', value: '0%', sub: 'Days booked / available', icon: <MdTrendingUp size={24} />, bgColor: 'bg-purple-50', iconColor: 'text-purple-600', ringColor: 'from-purple-400 to-violet-500' },
    { label: 'Total Views', value: '0', sub: 'Listing page views', icon: <MdVisibility size={24} />, bgColor: 'bg-amber-50', iconColor: 'text-amber-600', ringColor: 'from-amber-400 to-orange-500' },
];

const tips = [
    'Add high-quality photos to your listings to attract more views',
    'Enable instant booking to reduce friction for advertisers',
    'Price competitively based on location and traffic score',
    'Respond quickly to booking requests to maintain a high rating',
];

const OwnerAnalytics: React.FC = () => {
    const hasData = false;

    return (
        <DashboardLayout
            userRole="owner"
            title="Analytics"
            subtitle="Track your billboard performance and revenue"
        >
            {!hasData ? (
                <div className="space-y-8">
                    {/* Overview Cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {statCards.map((card, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-2xl ${card.bgColor} flex items-center justify-center`}>
                                            <span className={card.iconColor}>{card.icon}</span>
                                        </div>
                                        <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${card.ringColor} opacity-40`} />
                                    </div>
                                    <p className="text-sm text-neutral-500">{card.label}</p>
                                    <p className="text-2xl font-bold text-neutral-900 mt-1">{card.value}</p>
                                    <p className="text-xs text-neutral-400 mt-1">{card.sub}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Revenue Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-neutral-900 mb-6">Revenue Over Time</h3>
                            <div className="h-64 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl">
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <MdTrendingUp size={48} className="text-neutral-300 mb-4" />
                                </motion.div>
                                <p className="text-neutral-500 font-medium">No revenue data yet</p>
                                <p className="text-sm text-neutral-400 mt-1">
                                    Revenue charts will appear once you receive bookings
                                </p>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Performance Insights */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-neutral-900 mb-6">Top Performing Billboards</h3>
                            <div className="h-48 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl">
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <MdAnalytics size={40} className="text-neutral-300 mb-3" />
                                </motion.div>
                                <p className="text-neutral-500 text-sm">No performance data yet</p>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-neutral-900 mb-6">Bookings by Month</h3>
                            <div className="h-48 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <MdCalendarToday size={40} className="text-neutral-300 mb-3" />
                                </motion.div>
                                <p className="text-neutral-500 text-sm">No booking data yet</p>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Tips */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <Card className="p-6 md:p-8 bg-gradient-to-r from-primary-50 via-white to-accent-50 border-0">
                            <h3 className="text-lg font-bold text-neutral-900 mb-6">💡 Tips to Boost Your Analytics</h3>
                            <ul className="space-y-4 text-sm text-neutral-600">
                                {tips.map((tip, i) => (
                                    <motion.li
                                        key={i}
                                        custom={i}
                                        initial="hidden"
                                        animate="visible"
                                        variants={tipVariants}
                                        className="flex items-start gap-3"
                                    >
                                        <motion.span
                                            whileHover={{ scale: 1.1 }}
                                            className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm"
                                        >
                                            {i + 1}
                                        </motion.span>
                                        <span className="leading-relaxed">{tip}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </Card>
                    </motion.div>
                </div>
            ) : (
                <EmptyState
                    icon={<MdAnalytics />}
                    title="Analytics Coming Soon"
                    description="Detailed analytics and insights will be available once you have booking activity."
                />
            )}
        </DashboardLayout>
    );
};

export default OwnerAnalytics;
