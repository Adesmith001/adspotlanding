import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MdSearch,
    MdCampaign,
    MdFavorite,
    MdPayment,
    MdMessage,
    MdTrendingUp,
    MdArrowForward,
    MdCalendarToday,
} from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { getAdvertiserBookings } from '@/services/billboard.service';
import type { Booking } from '@/types/billboard.types';

const AdvertiserDashboard: React.FC = () => {
    const user = useAppSelector(selectUser);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const bookingsData = await getAdvertiserBookings(user.uid);
                setBookings(bookingsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const stats = {
        activeCampaigns: bookings.filter(b => b.status === 'active' || (b.status === 'confirmed' && b.paymentStatus === 'paid')).length,
        upcomingCampaigns: bookings.filter(b => b.status === 'confirmed' && b.paymentStatus !== 'paid').length,
        completedCampaigns: bookings.filter(b => b.status === 'completed').length,
        totalSpend: bookings.filter(b => b.paymentStatus === 'paid').reduce((acc, b) => acc + b.totalAmount, 0),
    };

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
        });
    };

    if (loading) {
        return (
            <DashboardLayout
                userRole="advertiser"
                title={`Welcome back, ${user?.displayName?.split(' ')[0] || 'Advertiser'}! 👋`}
                subtitle="Track your campaigns and discover new opportunities"
            >
                <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="p-6">
                                <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2" />
                                <div className="h-8 bg-neutral-200 rounded w-3/4" />
                            </Card>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            userRole="advertiser"
            title={`Welcome back, ${user?.displayName?.split(' ')[0] || 'Advertiser'}! 👋`}
            subtitle="Track your campaigns and discover new opportunities"
            actions={
                <Link to="/listings">
                    <Button icon={<MdSearch />}>Find Billboards</Button>
                </Link>
            }
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 mb-1">Active Campaigns</p>
                            <p className="text-3xl font-bold text-neutral-900">{stats.activeCampaigns}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                            <MdCampaign size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 mb-1">Upcoming</p>
                            <p className="text-3xl font-bold text-neutral-900">{stats.upcomingCampaigns}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <MdCalendarToday size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 mb-1">Completed</p>
                            <p className="text-3xl font-bold text-neutral-900">{stats.completedCampaigns}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <MdTrendingUp size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 mb-1">Total Spend</p>
                            <p className="text-2xl font-bold text-neutral-900">{formatPrice(stats.totalSpend)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <MdPayment size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            {bookings.length === 0 ? (
                <EmptyState
                    icon={<MdCampaign />}
                    title="No Campaigns Yet"
                    description="Start your first advertising campaign by browsing available billboards. Find the perfect location to showcase your brand."
                    actionLabel="Browse Billboards"
                    actionHref="/listings"
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Campaigns */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-neutral-900">Active Campaigns</h3>
                            <Link
                                to="/dashboard/advertiser/campaigns"
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View all →
                            </Link>
                        </div>

                        {stats.activeCampaigns === 0 ? (
                            <div className="py-8 text-center">
                                <MdCampaign size={40} className="text-neutral-300 mx-auto mb-3" />
                                <p className="text-neutral-500">No active campaigns</p>
                                <p className="text-sm text-neutral-400">
                                    Book a billboard to start your campaign
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings
                                    .filter(b => b.status === 'active' || (b.status === 'confirmed' && b.paymentStatus === 'paid'))
                                    .slice(0, 3)
                                    .map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-0"
                                        >
                                            <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                                                {booking.billboardPhoto ? (
                                                    <img
                                                        src={booking.billboardPhoto}
                                                        alt={booking.billboardTitle}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <MdCampaign className="text-neutral-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-neutral-900 truncate">
                                                    {booking.billboardTitle}
                                                </p>
                                                <p className="text-sm text-neutral-500">
                                                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                                </p>
                                            </div>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                Live
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link
                                to="/listings"
                                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                                        <MdSearch size={20} />
                                    </div>
                                    <span className="font-medium text-neutral-900">Browse Billboards</span>
                                </div>
                                <MdArrowForward className="text-neutral-400" />
                            </Link>

                            <Link
                                to="/dashboard/advertiser/campaigns"
                                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                        <MdCampaign size={20} />
                                    </div>
                                    <span className="font-medium text-neutral-900">My Campaigns</span>
                                </div>
                                <MdArrowForward className="text-neutral-400" />
                            </Link>

                            <Link
                                to="/dashboard/advertiser/favorites"
                                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                        <MdFavorite size={20} />
                                    </div>
                                    <span className="font-medium text-neutral-900">Favorites</span>
                                </div>
                                <MdArrowForward className="text-neutral-400" />
                            </Link>

                            <Link
                                to="/dashboard/advertiser/messages"
                                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <MdMessage size={20} />
                                    </div>
                                    <span className="font-medium text-neutral-900">Messages</span>
                                </div>
                                <MdArrowForward className="text-neutral-400" />
                            </Link>
                        </div>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdvertiserDashboard;
