import React, { useState, useEffect } from 'react';
import { MdBookmarkBorder, MdCheck, MdClose, MdAccessTime } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { getOwnerBookings, updateBookingStatus } from '@/services/billboard.service';
import type { Booking, BookingStatus } from '@/types/billboard.types';
import toast from 'react-hot-toast';

type TabType = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

const OwnerBookings: React.FC = () => {
    const user = useAppSelector(selectUser);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('pending');

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;

            try {
                const data = await getOwnerBookings(user.uid);
                setBookings(data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    const handleUpdateStatus = async (bookingId: string, status: BookingStatus) => {
        try {
            await updateBookingStatus(bookingId, status);
            setBookings((prev) =>
                prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
            );
            toast.success(`Booking ${status === 'confirmed' ? 'accepted' : status}`);
        } catch (error) {
            toast.error('Failed to update booking');
        }
    };

    const filteredBookings = bookings.filter((b) => b.status === activeTab);

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

    const tabs: { key: TabType; label: string; count: number }[] = [
        { key: 'pending', label: 'Pending', count: bookings.filter((b) => b.status === 'pending').length },
        { key: 'confirmed', label: 'Confirmed', count: bookings.filter((b) => b.status === 'confirmed').length },
        { key: 'active', label: 'Active', count: bookings.filter((b) => b.status === 'active').length },
        { key: 'completed', label: 'Completed', count: bookings.filter((b) => b.status === 'completed').length },
        { key: 'cancelled', label: 'Cancelled', count: bookings.filter((b) => b.status === 'cancelled').length },
    ];

    const getEmptyStateContent = (tab: TabType) => {
        const content: Record<TabType, { title: string; description: string }> = {
            pending: {
                title: 'No Pending Requests',
                description: 'When advertisers request to book your billboards, they will appear here for your approval.',
            },
            confirmed: {
                title: 'No Confirmed Bookings',
                description: 'Bookings you have accepted will appear here until they become active.',
            },
            active: {
                title: 'No Active Bookings',
                description: 'Campaigns currently running on your billboards will appear here.',
            },
            completed: {
                title: 'No Completed Bookings',
                description: 'Past bookings that have finished will appear here for your records.',
            },
            cancelled: {
                title: 'No Cancelled Bookings',
                description: 'Bookings that were cancelled will appear here.',
            },
        };
        return content[tab];
    };

    if (loading) {
        return (
            <DashboardLayout
                userRole="owner"
                title="Bookings"
                subtitle="Manage booking requests and active campaigns"
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
            userRole="owner"
            title="Bookings"
            subtitle="Manage booking requests and active campaigns"
        >
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                            }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <EmptyState
                    icon={<MdBookmarkBorder />}
                    title={getEmptyStateContent(activeTab).title}
                    description={getEmptyStateContent(activeTab).description}
                />
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <Card key={booking.id} className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Billboard & Advertiser Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                                        {booking.billboardPhoto ? (
                                            <img
                                                src={booking.billboardPhoto}
                                                alt={booking.billboardTitle}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MdBookmarkBorder size={24} className="text-neutral-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900">{booking.billboardTitle}</h3>
                                        <p className="text-sm text-neutral-600 mb-1">
                                            Requested by: {booking.advertiserName}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            {booking.advertiserEmail}
                                        </p>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div>
                                        <p className="text-neutral-500">Duration</p>
                                        <p className="font-medium text-neutral-900">
                                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                        </p>
                                        <p className="text-neutral-500">{booking.duration} days</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-500">Total Amount</p>
                                        <p className="font-bold text-neutral-900 text-lg">
                                            {formatPrice(booking.totalAmount)}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {activeTab === 'pending' && (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                icon={<MdCheck />}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                                                icon={<MdClose />}
                                            >
                                                Decline
                                            </Button>
                                        </>
                                    )}
                                    {activeTab === 'confirmed' && (
                                        <div className="flex items-center gap-2 text-amber-600">
                                            <MdAccessTime size={20} />
                                            <span className="text-sm font-medium">Awaiting Payment</span>
                                        </div>
                                    )}
                                    {activeTab === 'active' && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                            In Progress
                                        </span>
                                    )}
                                    {activeTab === 'completed' && (
                                        <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                                            Completed
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default OwnerBookings;
