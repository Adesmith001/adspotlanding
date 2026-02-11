import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

    const tabs: { key: TabType; label: string }[] = [
        { key: 'active', label: 'Active' },
        { key: 'upcoming', label: 'Upcoming' },
        { key: 'completed', label: 'Completed' },
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
            <div className="flex gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.key
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Campaigns List */}
            {filteredBookings.length === 0 ? (
                <EmptyState
                    icon={<MdCampaign />}
                    title={getEmptyStateContent(activeTab).title}
                    description={getEmptyStateContent(activeTab).description}
                    actionLabel="Find Billboards"
                    actionHref="/listings"
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredBookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                            <div className="flex">
                                {/* Billboard Image */}
                                <div className="w-32 h-32 flex-shrink-0 bg-neutral-100">
                                    {booking.billboardPhoto ? (
                                        <img
                                            src={booking.billboardPhoto}
                                            alt={booking.billboardTitle}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
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
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
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

                            {/* Campaign Stats (for active campaigns) */}
                            {activeTab === 'active' && (
                                <div className="px-4 pb-4">
                                    <div className="pt-3 border-t border-neutral-100 flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-neutral-600">
                                            <MdTrendingUp size={16} className="text-green-500" />
                                            <span>Estimated impressions: --</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default MyCampaigns;
