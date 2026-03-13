import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdBookmarkBorder, MdCheck, MdClose, MdAccessTime, MdMessage, MdPictureAsPdf } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { getOwnerBookings, updateBookingStatus, updateCreativeApprovalStatus } from '@/services/billboard.service';
import { startConversation } from '@/services/message.service';
import type { Booking, BookingStatus } from '@/types/billboard.types';
import { getAssetLabelFromUrl, isPdfUrl } from '@/utils/media.utils';
import toast from 'react-hot-toast';

type TabType = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const OwnerBookings: React.FC = () => {
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [messagingBookingId, setMessagingBookingId] = useState<string | null>(null);
    const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);

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

    const handleMessageAdvertiser = async (booking: Booking) => {
        if (!user) return;
        setMessagingBookingId(booking.id);
        const toastId = toast.loading('Opening conversation...');

        try {
            const conversationId = await startConversation(
                user.uid,
                booking.advertiserId,
                `Hi ${booking.advertiserName}, I am reviewing the creative for "${booking.billboardTitle}".`,
            );
            toast.success('Conversation ready in Messages.', { id: toastId });
            navigate(`/dashboard/owner/messages?conversation=${conversationId}`);
        } catch {
            toast.error('Failed to open conversation.', { id: toastId });
        } finally {
            setMessagingBookingId(null);
        }
    };

    const handleCreativeReview = async (booking: Booking, nextStatus: 'approved' | 'changes_requested') => {
        setReviewingBookingId(booking.id);

        try {
            const updated = await updateCreativeApprovalStatus(
                booking.id,
                nextStatus,
                nextStatus === 'changes_requested'
                    ? 'Please message the advertiser for more detail or updated artwork before launch.'
                    : 'Creative approved for launch.',
            );

            if (updated) {
                setBookings((prev) => prev.map((item) => (item.id === booking.id ? updated : item)));
            }

            toast.success(nextStatus === 'approved' ? 'Creative approved' : 'Creative changes requested');
        } catch {
            toast.error('Failed to update creative approval');
        } finally {
            setReviewingBookingId(null);
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
            pending: { title: 'No Pending Requests', description: 'When advertisers request to book your billboards, they will appear here for your approval.' },
            confirmed: { title: 'No Confirmed Bookings', description: 'Bookings you have accepted will appear here until they become active.' },
            active: { title: 'No Active Bookings', description: 'Campaigns currently running on your billboards will appear here.' },
            completed: { title: 'No Completed Bookings', description: 'Past bookings that have finished will appear here for your records.' },
            cancelled: { title: 'No Cancelled Bookings', description: 'Bookings that were cancelled will appear here.' },
        };
        return content[tab];
    };

    if (loading) {
        return (
            <DashboardLayout userRole="owner" title="Bookings" subtitle="Manage booking requests and active campaigns">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-6">
                            <div className="flex gap-4">
                                <div className="w-20 h-20 skeleton-shimmer rounded-xl" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 skeleton-shimmer w-1/3" />
                                    <div className="h-4 skeleton-shimmer w-1/2" />
                                    <div className="h-4 skeleton-shimmer w-1/4" />
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
            userRole="owner"
            title="Bookings"
            subtitle="Manage booking requests and active campaigns"
        >
            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab.key
                            ? 'text-white'
                            : 'text-neutral-600 hover:bg-neutral-100 border border-neutral-200 bg-white'
                            }`}
                    >
                        {activeTab === tab.key && (
                            <motion.div
                                layoutId="booking-tab"
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
                                    transition={{ type: 'spring', stiffness: 300 }}
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

            {/* Bookings List */}
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
                            icon={<MdBookmarkBorder />}
                            title={getEmptyStateContent(activeTab).title}
                            description={getEmptyStateContent(activeTab).description}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key={`list-${activeTab}`}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {filteredBookings.map((booking) => (
                            <motion.div key={booking.id} variants={itemVariants}>
                                <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        {/* Billboard & Advertiser Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                                                {booking.billboardPhoto ? (
                                                    <img
                                                        src={booking.billboardPhoto}
                                                        alt={booking.billboardTitle}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                                                        <MdBookmarkBorder size={24} className="text-neutral-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-neutral-900 mb-1">{booking.billboardTitle}</h3>
                                                <p className="text-sm text-neutral-600 mb-0.5">
                                                    Requested by: <span className="font-medium">{booking.advertiserName}</span>
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {booking.advertiserEmail}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="flex flex-wrap items-center gap-6 text-sm">
                                            <div>
                                                <p className="text-neutral-500 text-xs mb-1">Duration</p>
                                                <p className="font-medium text-neutral-900">
                                                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                                </p>
                                                <p className="text-xs text-neutral-500">{booking.duration} days</p>
                                            </div>
                                            <div>
                                                <p className="text-neutral-500 text-xs mb-1">Total Amount</p>
                                                <p className="font-bold text-neutral-900 text-lg">
                                                    {formatPrice(booking.totalAmount)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="lg:min-w-[320px] rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                                            <div className="flex items-center justify-between gap-3 mb-3">
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-neutral-500">Creative review</p>
                                                    <p className="text-sm font-semibold text-neutral-900">
                                                        {booking.creativeRequirementType === 'advertiser_upload'
                                                            ? 'Advertiser uploaded design'
                                                            : 'Owner design service requested'}
                                                    </p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${booking.creativeApprovalStatus === 'approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : booking.creativeApprovalStatus === 'changes_requested'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-primary-100 text-primary-700'
                                                    }`}>
                                                    {booking.creativeApprovalStatus.replace('_', ' ')}
                                                </span>
                                            </div>

                                            {booking.creativeAssets.length > 0 && (
                                                <div className="grid grid-cols-3 gap-2 mb-3">
                                                    {booking.creativeAssets.slice(0, 3).map((asset) => (
                                                        <a key={asset} href={asset} target="_blank" rel="noreferrer" className="block">
                                                            {isPdfUrl(asset) ? (
                                                                <div className="flex h-20 w-full flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2 text-center">
                                                                    <MdPictureAsPdf size={26} className="text-red-600" />
                                                                    <span className="mt-1 line-clamp-2 text-[11px] font-medium text-red-700">
                                                                        {getAssetLabelFromUrl(asset)}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <img src={asset} alt="Creative asset" className="h-20 w-full rounded-lg object-cover border border-neutral-200" />
                                                            )}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            <p className="text-sm text-neutral-600 leading-relaxed">
                                                {booking.creativeBrief}
                                            </p>

                                            {booking.creativeReviewNotes && (
                                                <p className="text-xs text-neutral-500 mt-3">
                                                    Review note: {booking.creativeReviewNotes}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {activeTab === 'pending' && (
                                                <>
                                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                            icon={<MdCheck />}
                                                        >
                                                            Accept
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                                                            icon={<MdClose />}
                                                        >
                                                            Decline
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleMessageAdvertiser(booking)}
                                                            icon={<MdMessage />}
                                                            disabled={messagingBookingId === booking.id}
                                                        >
                                                            {messagingBookingId === booking.id ? 'Opening...' : 'Message'}
                                                        </Button>
                                                    </motion.div>
                                                </>
                                            )}
                                            {activeTab === 'confirmed' && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                                                        <MdAccessTime size={18} />
                                                        <span className="text-sm font-medium">
                                                            {booking.creativeApprovalStatus === 'approved'
                                                                ? (booking.paymentStatus === 'paid' ? 'Ready To Launch' : 'Awaiting Advertiser Payment')
                                                                : 'Approve Creative To Unlock Payment'}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleCreativeReview(booking, 'approved')}
                                                        disabled={reviewingBookingId === booking.id || booking.creativeApprovalStatus === 'approved'}
                                                    >
                                                        Approve Creative
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCreativeReview(booking, 'changes_requested')}
                                                        disabled={reviewingBookingId === booking.id}
                                                    >
                                                        Request Changes
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleMessageAdvertiser(booking)}
                                                        disabled={messagingBookingId === booking.id}
                                                        icon={<MdMessage />}
                                                    >
                                                        Message
                                                    </Button>
                                                </div>
                                            )}
                                            {activeTab === 'active' && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-live-pulse" />
                                                        In Progress
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleMessageAdvertiser(booking)}
                                                        disabled={messagingBookingId === booking.id}
                                                        icon={<MdMessage />}
                                                    >
                                                        Message
                                                    </Button>
                                                </div>
                                            )}
                                            {activeTab === 'completed' && (
                                                <span className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                                                    Completed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default OwnerBookings;
