import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MdAdd,
    MdTrendingUp,
    MdVisibility,
    MdList,
    MdBookmarkBorder,
    MdMessage,
    MdArrowForward,
} from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { getOwnerBillboards, getOwnerBookings } from '@/services/billboard.service';
import type { Billboard, Booking } from '@/types/billboard.types';

const OwnerDashboard: React.FC = () => {
    const user = useAppSelector(selectUser);
    const [billboards, setBillboards] = useState<Billboard[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const [billboardsData, bookingsData] = await Promise.all([
                    getOwnerBillboards(user.uid),
                    getOwnerBookings(user.uid),
                ]);
                setBillboards(billboardsData);
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
        totalBillboards: billboards.length,
        activeBookings: bookings.filter(b => b.status === 'active').length,
        pendingRequests: bookings.filter(b => b.status === 'pending').length,
        totalViews: billboards.reduce((acc, b) => acc + (b.views || 0), 0),
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <DashboardLayout
                userRole="owner"
                title={`Welcome back, ${user?.displayName?.split(' ')[0] || 'Owner'}! 👋`}
                subtitle="Here's what's happening with your billboards"
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
            userRole="owner"
            title={`Welcome back, ${user?.displayName?.split(' ')[0] || 'Owner'}! 👋`}
            subtitle="Here's what's happening with your billboards"
            actions={
                <Link to="/dashboard/owner/create">
                    <Button icon={<MdAdd />}>Add Listing</Button>
                </Link>
            }
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 mb-1">Total Billboards</p>
                            <p className="text-3xl font-bold text-neutral-900">{stats.totalBillboards}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <MdList size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 mb-1">Active Bookings</p>
                            <p className="text-3xl font-bold text-neutral-900">{stats.activeBookings}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                            <MdTrendingUp size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 mb-1">Pending Requests</p>
                            <p className="text-3xl font-bold text-neutral-900">{stats.pendingRequests}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <MdBookmarkBorder size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-neutral-500 mb-1">Total Views</p>
                            <p className="text-3xl font-bold text-neutral-900">{stats.totalViews}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <MdVisibility size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            {billboards.length === 0 ? (
                <EmptyState
                    icon={<MdList />}
                    title="No Listings Yet"
                    description="Create your first billboard listing to start earning from advertisers. It only takes a few minutes to get started."
                    actionLabel="Create Your First Listing"
                    actionHref="/dashboard/owner/create"
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Bookings */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-neutral-900">Recent Booking Requests</h3>
                            <Link
                                to="/dashboard/owner/bookings"
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View all →
                            </Link>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="py-8 text-center">
                                <MdBookmarkBorder size={40} className="text-neutral-300 mx-auto mb-3" />
                                <p className="text-neutral-500">No booking requests yet</p>
                                <p className="text-sm text-neutral-400">
                                    Requests will appear here when advertisers book your billboards
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.slice(0, 3).map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium text-neutral-900">{booking.billboardTitle}</p>
                                            <p className="text-sm text-neutral-500">
                                                by {booking.advertiserName}
                                            </p>
                                        </div>
                                        <span className="font-bold text-green-600">
                                            {formatPrice(booking.totalAmount)}
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
                                to="/dashboard/owner/create"
                                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                                        <MdAdd size={20} />
                                    </div>
                                    <span className="font-medium text-neutral-900">Add New Listing</span>
                                </div>
                                <MdArrowForward className="text-neutral-400" />
                            </Link>

                            <Link
                                to="/dashboard/owner/listings"
                                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <MdList size={20} />
                                    </div>
                                    <span className="font-medium text-neutral-900">Manage Listings</span>
                                </div>
                                <MdArrowForward className="text-neutral-400" />
                            </Link>

                            <Link
                                to="/dashboard/owner/analytics"
                                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                        <MdTrendingUp size={20} />
                                    </div>
                                    <span className="font-medium text-neutral-900">View Analytics</span>
                                </div>
                                <MdArrowForward className="text-neutral-400" />
                            </Link>

                            <Link
                                to="/dashboard/owner/messages"
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

export default OwnerDashboard;
