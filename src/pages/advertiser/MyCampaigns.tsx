import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCampaign, MdCalendarToday, MdTrendingUp } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { getAdvertiserBookings } from '@/services/billboard.service';
import type { Booking } from '@/types/billboard.types';

type TabType = 'active' | 'upcoming' | 'completed';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const MyCampaigns: React.FC = () => {
    const user = useAppSelector(selectUser);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('active');

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;
            try {
                const data = await getAdvertiserBookings(user.uid);
                setBookings(data);
            } catch (error) {
                console.error('Error fetching campaigns:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user]);

    const getFilteredBookings = () => {
        const now = new Date();
        switch (activeTab) {
            case 'active':
                return bookings.filter((b) => b.status === 'active');
            case 'upcoming':
                return bookings.filter((b) =>
                    b.status === 'confirmed' && new Date(b.startDate) > now
                );
            case 'completed':
                return bookings.filter((b) => b.status === 'completed');
            default:
                return [];
        }
    };

    const filteredBookings = getFilteredBookings();

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
        });
    };

    const getDaysRemaining = (endDate: Date) => {
        const now = new Date();
        const end = new Date(endDate);
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const getDaysTotal = (startDate: Date, endDate: Date) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getProgress = (startDate: Date, endDate: Date) => {
        const total = getDaysTotal(startDate, endDate);
        const remaining = getDaysRemaining(endDate);
        if (total <= 0) return 100;
        return Math.round(((total - remaining) / total) * 100);
    };

    const tabs: { key: TabType; label: string; count: number }[] = [
        { key: 'active', label: 'Active', count: bookings.filter(b => b.status === 'active').length },
        { key: 'upcoming', label: 'Upcoming', count: bookings.filter(b => b.status === 'confirmed' && new Date(b.startDate) > new Date()).length },
        { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    ];

    const getEmptyStateContent = (tab: TabType) => {
        const content: Record<TabType, { title: string; description: string }> = {
            active: {
                title: 'No Active Campaigns',
                description: 'Campaigns currently running on billboards will appear here. Book a billboard to start advertising!',
            },
            upcoming: {
                title: 'No Upcoming Campaigns',
                description: 'Confirmed bookings that are scheduled to start will appear here.',
            },
            completed: {
                title: 'No Completed Campaigns',
                description: 'Your past advertising campaigns will be stored here for reference.',
            },
        };
        return content[tab];
    };

    if (loading) {
        return (
            <DashboardLayout
                userRole="advertiser"
                title="My Campaigns"
                subtitle="Track your advertising campaigns"
            >
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-6">
                            <div className="flex gap-4">
                                <div className="w-32 h-24 skeleton-shimmer rounded-xl" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 skeleton-shimmer w-1/3" />
                                    <div className="h-4 skeleton-shimmer w-1/2" />
                                    <div className="h-3 skeleton-shimmer w-full rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            userRole="advertiser"
            title="My Campaigns"
            subtitle="Track your advertising campaigns"
            actions={
                <Link to="/listings">
                    <Button>Browse Billboards</Button>
                </Link>
            }
        >
            {/* Tabs */}
            <div className="flex gap-2 mb-8 relative overflow-x-auto pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.key
                            ? 'text-white'
                            : 'text-neutral-600 hover:bg-neutral-100 border border-neutral-200 bg-white'
                            }`}
                    >
                        {activeTab === tab.key && (
                            <motion.div
                                layoutId="campaign-tab"
                                className="absolute inset-0 bg-neutral-900 rounded-full"
                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {tab.label}
                            {tab.count > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.key
                                        ? 'bg-white/20 text-white'
                                        : 'bg-neutral-100 text-neutral-600'
                                        }`}
                                >
                                    {tab.count}
                                </motion.span>
                            )}
                        </span>
                    </button>
                ))}
            </div>

            {/* Campaigns List */}
            <AnimatePresence mode="wait">
                {filteredBookings.length === 0 ? (
                    <motion.div
                        key={`empty-${activeTab}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <EmptyState
                            icon={<MdCampaign />}
                            title={getEmptyStateContent(activeTab).title}
                            description={getEmptyStateContent(activeTab).description}
                            actionLabel="Find Billboards"
                            actionHref="/listings"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key={`list-${activeTab}`}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {filteredBookings.map((booking) => (
                            <motion.div key={booking.id} variants={itemVariants}>
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Billboard Image */}
                                        <div className="w-full h-44 sm:w-32 sm:h-32 flex-shrink-0 bg-neutral-100 overflow-hidden">
                                            {booking.billboardPhoto ? (
                                                <img
                                                    src={booking.billboardPhoto}
                                                    alt={booking.billboardTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                                                    <MdCampaign size={32} className="text-neutral-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-neutral-900 line-clamp-1">
                                                    {booking.billboardTitle}
                                                </h3>
                                                {activeTab === 'active' && (
                                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex-shrink-0 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-live-pulse" />
                                                        Live
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <MdCalendarToday size={14} className="text-neutral-400" />
                                                    <span>
                                                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-neutral-900">
                                                        {formatPrice(booking.totalAmount)}
                                                    </span>
                                                    {activeTab === 'active' && (
                                                        <span className="text-xs text-neutral-500">
                                                            {getDaysRemaining(booking.endDate)} days remaining
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar for active campaigns */}
                                    {activeTab === 'active' && (
                                        <div className="px-4 pb-4">
                                            <div className="pt-3 border-t border-neutral-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                                                        <MdTrendingUp size={14} className="text-green-500" />
                                                        <span>Campaign progress</span>
                                                    </div>
                                                    <span className="text-xs font-medium text-neutral-700">
                                                        {getProgress(booking.startDate, booking.endDate)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${getProgress(booking.startDate, booking.endDate)}%` }}
                                                        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                                                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default MyCampaigns;
