import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdCampaign,
    MdCalendarToday,
    MdDesignServices,
    MdTrendingUp,
    MdPerson,
    MdVisibility,
    MdMessage,
    MdFlag,
    MdTimer,
    MdPayment,
    MdPictureAsPdf,
    MdStar,
    MdStarBorder,
    MdRateReview,
} from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import {
    subscribeToAdvertiserBookings,
    getBillboard,
    createReview,
    checkAndCompleteExpiredCampaigns,
} from '@/services/billboard.service';
import { subscribeToAdvertiserPaidBookings } from '@/services/payment.service';
import { submitReport, type ReportCategory } from '@/services/admin.service';
import { startConversation } from '@/services/message.service';
import type { Booking } from '@/types/billboard.types';
import { getAssetLabelFromUrl, isPdfUrl } from '@/utils/media.utils';
import toast from 'react-hot-toast';

type TabType = 'active' | 'upcoming' | 'completed';

interface ReportForm {
    category: ReportCategory;
    subject: string;
    description: string;
}

const REPORT_CATEGORIES: { value: ReportCategory; label: string }[] = [
    { value: 'billing', label: 'Billing / Payment Issue' },
    { value: 'fraud', label: 'Fraud / Scam' },
    { value: 'service_issue', label: 'Service / Quality Issue' },
    { value: 'content', label: 'Inappropriate Content' },
    { value: 'other', label: 'Other' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// Star Rating component
const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(star)}
                    className="text-amber-400 transition-transform hover:scale-110"
                >
                    {star <= (hovered || value) ? (
                        <MdStar size={32} />
                    ) : (
                        <MdStarBorder size={32} />
                    )}
                </button>
            ))}
        </div>
    );
};

const MyCampaigns: React.FC = () => {
    const user = useAppSelector(selectUser);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [billboardViews, setBillboardViews] = useState<Record<string, number>>({});
    const [paidBookingsById, setPaidBookingsById] = useState<Record<string, { reference: string }>>({});

    // Report modal state
    const [reportBooking, setReportBooking] = useState<Booking | null>(null);
    const [reportForm, setReportForm] = useState<ReportForm>({
        category: 'billing',
        subject: '',
        description: '',
    });
    const [submittingReport, setSubmittingReport] = useState(false);

    // Message owner loading state
    const [messagingBookingId, setMessagingBookingId] = useState<string | null>(null);

    // Review modal state
    const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Auto-complete expired campaigns when the page loads
    useEffect(() => {
        if (!user) return;
        checkAndCompleteExpiredCampaigns(user.uid).catch(console.error);
    }, [user]);

    // Real-time subscription — fires immediately when Firestore updates after payment
    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToAdvertiserBookings(user.uid, (data) => {
            setBookings(data);
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToAdvertiserPaidBookings(user.uid, (data) => {
            const nextState = Object.fromEntries(
                Object.entries(data).map(([bookingId, info]) => [bookingId, { reference: info.reference }]),
            );
            setPaidBookingsById(nextState);
        });
        return unsubscribe;
    }, [user]);

    // Fetch billboard views for all unique billboards
    useEffect(() => {
        if (bookings.length === 0) return;
        const uniqueIds = [...new Set(bookings.map((b) => b.billboardId))];
        Promise.all(
            uniqueIds.map(async (bid) => {
                try {
                    const bb = await getBillboard(bid);
                    return { id: bid, views: bb?.views || 0 };
                } catch {
                    return { id: bid, views: 0 };
                }
            }),
        ).then((results) => {
            const map: Record<string, number> = {};
            results.forEach((r) => { map[r.id] = r.views; });
            setBillboardViews(map);
        });
    }, [bookings]);

    // Handle ?review=<bookingId> from notification action link
    useEffect(() => {
        const reviewBookingId = searchParams.get('review');
        if (!reviewBookingId || bookings.length === 0) return;

        const target = bookings.find((b) => b.id === reviewBookingId);
        if (target && !target.reviewedAt) {
            setActiveTab('completed');
            setReviewBooking(target);
            setReviewRating(0);
            setReviewComment('');
            // Remove the query param so it doesn't re-trigger
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, bookings, setSearchParams]);

    const isPaidBooking = (booking: Booking) =>
        booking.paymentStatus === 'paid' || !!paidBookingsById[booking.id];

    const getPaymentReference = (booking: Booking) =>
        booking.paymentId || paidBookingsById[booking.id]?.reference || '';

    const isActive = (booking: Booking) => booking.status === 'active';

    const isReadyForPayment = (booking: Booking) =>
        booking.status === 'confirmed' &&
        !isPaidBooking(booking) &&
        booking.creativeApprovalStatus === 'approved';

    const isCompleted = (booking: Booking) =>
        booking.status === 'completed' || new Date(booking.endDate) < new Date();

    const getFilteredBookings = () => {
        const now = new Date();
        switch (activeTab) {
            case 'active':
                return bookings.filter(isActive);
            case 'upcoming':
                return bookings.filter(
                    (b) =>
                        b.status === 'confirmed' &&
                        new Date(b.startDate) > now,
                );
            case 'completed':
                return bookings.filter(isCompleted);
            default:
                return [];
        }
    };

    const filteredBookings = getFilteredBookings();

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

    const formatDate = (date: Date) =>
        new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

    const getDaysRemaining = (endDate: Date) => {
        const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    const getDaysTotal = (startDate: Date, endDate: Date) =>
        Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));

    const getProgress = (startDate: Date, endDate: Date) => {
        const total = getDaysTotal(startDate, endDate);
        const remaining = getDaysRemaining(endDate);
        return Math.round(((total - remaining) / total) * 100);
    };

    const handleMessageOwner = async (booking: Booking) => {
        if (!user) return;
        setMessagingBookingId(booking.id);
        const toastId = toast.loading('Opening conversation...');
        try {
            const convoId = await startConversation(
                user.uid,
                booking.ownerId,
                `Hi, I'm reaching out about my campaign on "${booking.billboardTitle}".`,
            );
            toast.dismiss(toastId);
            navigate(`/dashboard/advertiser/messages?conversation=${convoId}`);
        } catch {
            toast.error('Failed to open conversation. Try again.', { id: toastId });
        } finally {
            setMessagingBookingId(null);
        }
    };

    const handleOpenReport = (booking: Booking) => {
        setReportBooking(booking);
        setReportForm({ category: 'billing', subject: '', description: '' });
    };

    const handleSubmitReport = async () => {
        if (!user || !reportBooking) return;
        if (!reportForm.subject.trim() || !reportForm.description.trim()) {
            toast.error('Please fill in all fields.');
            return;
        }
        setSubmittingReport(true);
        try {
            await submitReport(
                user.uid,
                user.displayName || 'Advertiser',
                user.email || '',
                {
                    bookingId: reportBooking.id,
                    billboardId: reportBooking.billboardId,
                    billboardTitle: reportBooking.billboardTitle,
                    ownerId: reportBooking.ownerId,
                    ownerName: reportBooking.ownerName,
                    category: reportForm.category,
                    subject: reportForm.subject.trim(),
                    description: reportForm.description.trim(),
                },
            );
            toast.success('Report submitted. Our team will review it shortly.');
            setReportBooking(null);
        } catch {
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setSubmittingReport(false);
        }
    };

    const handleOpenReview = useCallback((booking: Booking) => {
        setReviewBooking(booking);
        setReviewRating(0);
        setReviewComment('');
    }, []);

    const handleSubmitReview = async () => {
        if (!user || !reviewBooking) return;
        if (reviewRating === 0) {
            toast.error('Please select a star rating.');
            return;
        }
        if (reviewComment.trim().length < 10) {
            toast.error('Please write a comment of at least 10 characters.');
            return;
        }
        setSubmittingReview(true);
        try {
            await createReview(
                reviewBooking.id,
                reviewBooking.billboardId,
                user.uid,
                user.displayName || 'Advertiser',
                reviewRating,
                reviewComment.trim(),
            );
            toast.success('Review submitted! Thank you for your feedback. ⭐');
            // Optimistically mark as reviewed in local state
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === reviewBooking.id ? { ...b, reviewedAt: new Date() } : b,
                ),
            );
            setReviewBooking(null);
        } catch {
            toast.error('Failed to submit review. Please try again.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const tabs: { key: TabType; label: string; count: number }[] = [
        { key: 'active', label: 'Active', count: bookings.filter(isActive).length },
        {
            key: 'upcoming',
            label: 'Upcoming',
            count: bookings.filter(
                (b) => b.status === 'confirmed' && new Date(b.startDate) > new Date(),
            ).length,
        },
        { key: 'completed', label: 'Completed', count: bookings.filter(isCompleted).length },
    ];

    const getEmptyStateContent = (tab: TabType) => ({
        active: {
            title: 'No Active Campaigns',
            description: 'Campaigns currently running on billboards will appear here. Book a billboard to start advertising!',
        },
        upcoming: {
            title: 'No Upcoming Campaigns',
            description: 'Confirmed bookings scheduled to start will appear here.',
        },
        completed: {
            title: 'No Completed Campaigns',
            description: 'Your past advertising campaigns will be stored here for reference.',
        },
    }[tab]);

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
                                    className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
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
                        className="grid grid-cols-1 gap-6"
                    >
                        {filteredBookings.map((booking) => {
                            const views = billboardViews[booking.billboardId] ?? null;
                            const progress = getProgress(booking.startDate, booking.endDate);
                            const daysTotal = getDaysTotal(booking.startDate, booking.endDate);
                            const daysRemaining = getDaysRemaining(booking.endDate);
                            const paymentReference = getPaymentReference(booking);
                            const canReview = isCompleted(booking) && !booking.reviewedAt;

                            return (
                                <motion.div key={booking.id} variants={itemVariants}>
                                    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Billboard Image */}
                                            <div className="w-full h-48 sm:w-44 sm:h-auto flex-shrink-0 bg-neutral-100 overflow-hidden relative">
                                                {booking.billboardPhoto ? (
                                                    <img
                                                        src={booking.billboardPhoto}
                                                        alt={booking.billboardTitle}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                                                        <MdCampaign size={40} className="text-neutral-400" />
                                                    </div>
                                                )}
                                                {activeTab === 'active' && (
                                                    <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow">
                                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                        LIVE
                                                    </span>
                                                )}
                                                {activeTab === 'completed' && (
                                                    <span className="absolute top-2 left-2 px-2 py-1 bg-neutral-600 text-white text-xs font-bold rounded-full shadow">
                                                        ENDED
                                                    </span>
                                                )}
                                                {activeTab === 'upcoming' && (
                                                    <span className="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded-full shadow">
                                                        UPCOMING
                                                    </span>
                                                )}
                                            </div>

                                            {/* Main Content */}
                                            <div className="flex-1 p-5 flex flex-col gap-3">
                                                {/* Title + Amount row */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-bold text-neutral-900 text-base leading-tight">
                                                        {booking.billboardTitle}
                                                    </h3>
                                                    <span className="text-lg font-bold text-neutral-900 flex-shrink-0">
                                                        {formatPrice(booking.totalAmount)}
                                                    </span>
                                                </div>

                                                {/* Meta grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-sm text-neutral-600">
                                                    <div className="flex items-center gap-2">
                                                        <MdPerson size={15} className="text-neutral-400 flex-shrink-0" />
                                                        <span>
                                                            Owner:{' '}
                                                            <span className="font-medium text-neutral-800">
                                                                {booking.ownerName || 'N/A'}
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <MdVisibility size={15} className="text-neutral-400 flex-shrink-0" />
                                                        <span>
                                                            Billboard views:{' '}
                                                            <span className="font-medium text-neutral-800">
                                                                {views !== null ? views.toLocaleString() : '—'}
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <MdCalendarToday size={15} className="text-neutral-400 flex-shrink-0" />
                                                        <span>
                                                            Start:{' '}
                                                            <span className="font-medium text-neutral-800">
                                                                {formatDate(booking.startDate)}
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <MdCalendarToday size={15} className="text-neutral-400 flex-shrink-0" />
                                                        <span>
                                                            End:{' '}
                                                            <span className="font-medium text-neutral-800">
                                                                {formatDate(booking.endDate)}
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <MdTimer size={15} className="text-neutral-400 flex-shrink-0" />
                                                        <span>
                                                            Duration:{' '}
                                                            <span className="font-medium text-neutral-800">
                                                                {daysTotal} day{daysTotal !== 1 ? 's' : ''}
                                                            </span>
                                                            {activeTab === 'active' && daysRemaining > 0 && (
                                                                <span className="ml-1 text-green-600 font-medium">
                                                                    ({daysRemaining} left)
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    {paymentReference && (
                                                        <div className="flex items-center gap-2">
                                                            <MdPayment size={15} className="text-neutral-400 flex-shrink-0" />
                                                            <span className="truncate">
                                                                Ref:{' '}
                                                                <span className="font-mono text-xs font-medium text-neutral-800">
                                                                    {paymentReference}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Progress bar (active only) */}
                                                {activeTab === 'active' && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                                                                <MdTrendingUp size={13} className="text-green-500" />
                                                                <span>Campaign progress</span>
                                                            </div>
                                                            <span className="text-xs font-semibold text-neutral-700">
                                                                {progress}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${progress}%` }}
                                                                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                                                                className="h-full bg-[#d4f34a] rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div className="flex items-start gap-2">
                                                            <MdDesignServices size={18} className="text-neutral-500 mt-0.5" />
                                                            <div>
                                                                <p className="text-sm font-semibold text-neutral-900">Creative review</p>
                                                                <p className="text-xs text-neutral-500">
                                                                    {booking.creativeRequirementType === 'advertiser_upload'
                                                                        ? 'You uploaded the design for owner review.'
                                                                        : 'You requested the owner to create the design.'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${booking.creativeApprovalStatus === 'approved'
                                                            ? 'bg-green-100 text-green-700'
                                                            : booking.creativeApprovalStatus === 'changes_requested'
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-primary-100 text-primary-700'
                                                            }`}>
                                                            {(booking.creativeApprovalStatus ?? 'pending').replace('_', ' ')}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-neutral-600 leading-relaxed">
                                                        {booking.creativeBrief}
                                                    </p>

                                                    {(booking.creativeAssets?.length ?? 0) > 0 && (
                                                        <div className="grid grid-cols-3 gap-2 mt-3">
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
                                                                        <img src={asset} alt="Creative asset" className="h-20 w-full rounded-lg border border-neutral-200 object-cover" />
                                                                    )}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {booking.creativeReviewNotes && (
                                                        <p className="text-xs text-neutral-500 mt-3">
                                                            Owner note: {booking.creativeReviewNotes}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* ===== Review CTA (completed and not yet reviewed) ===== */}
                                                {canReview && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200"
                                                    >
                                                        <MdRateReview size={20} className="text-amber-500 flex-shrink-0" />
                                                        <p className="text-sm text-amber-800 font-medium flex-1">
                                                            How was your campaign? Share your experience!
                                                        </p>
                                                        <button
                                                            onClick={() => handleOpenReview(booking)}
                                                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors whitespace-nowrap"
                                                        >
                                                            Leave a Review
                                                        </button>
                                                    </motion.div>
                                                )}

                                                {/* Reviewed indicator */}
                                                {isCompleted(booking) && booking.reviewedAt && (
                                                    <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                                                        <MdStar size={14} />
                                                        Review submitted — thank you!
                                                    </div>
                                                )}

                                                {/* Action buttons */}
                                                <div className="flex items-center gap-2 pt-1 mt-auto flex-wrap">
                                                    {isReadyForPayment(booking) && (
                                                        <Link
                                                            to="/dashboard/advertiser/payments"
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors"
                                                        >
                                                            <MdPayment size={14} />
                                                            Complete Payment
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => handleMessageOwner(booking)}
                                                        disabled={messagingBookingId === booking.id}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-700 disabled:opacity-60 transition-colors"
                                                    >
                                                        <MdMessage size={14} />
                                                        {messagingBookingId === booking.id ? 'Opening...' : 'Message Owner'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenReport(booking)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                                                    >
                                                        <MdFlag size={14} />
                                                        Report Issue
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== Review Modal ===== */}
            <Modal
                isOpen={!!reviewBooking}
                onClose={() => setReviewBooking(null)}
                title="Leave a Review"
                size="md"
            >
                <div className="p-6 space-y-5">
                    {reviewBooking && (
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                            {reviewBooking.billboardPhoto ? (
                                <img
                                    src={reviewBooking.billboardPhoto}
                                    alt={reviewBooking.billboardTitle}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
                                    <MdCampaign size={20} className="text-neutral-400" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-neutral-900 text-sm truncate">
                                    {reviewBooking.billboardTitle}
                                </p>
                                <p className="text-xs text-neutral-500">Owner: {reviewBooking.ownerName}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-3">
                            Your Rating <span className="text-red-500">*</span>
                        </label>
                        <StarRating value={reviewRating} onChange={setReviewRating} />
                        {reviewRating > 0 && (
                            <p className="text-sm text-neutral-500 mt-1">
                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Your Comment <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience — was the billboard well-maintained? Was the owner responsive? Would you recommend this billboard?"
                            rows={4}
                            maxLength={500}
                            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                        <p className="text-xs text-neutral-400 mt-1 text-right">
                            {reviewComment.length}/500
                        </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={() => setReviewBooking(null)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitReview}
                            disabled={submittingReview || reviewRating === 0 || reviewComment.trim().length < 10}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                        >
                            <MdStar size={15} />
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ===== Report Modal ===== */}
            <Modal
                isOpen={!!reportBooking}
                onClose={() => setReportBooking(null)}
                title="Report an Issue"
                size="md"
            >
                <div className="p-6 space-y-4">
                    {reportBooking && (
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                            {reportBooking.billboardPhoto ? (
                                <img
                                    src={reportBooking.billboardPhoto}
                                    alt={reportBooking.billboardTitle}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
                                    <MdCampaign size={20} className="text-neutral-400" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-neutral-900 text-sm truncate">
                                    {reportBooking.billboardTitle}
                                </p>
                                <p className="text-xs text-neutral-500">Owner: {reportBooking.ownerName}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Issue Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={reportForm.category}
                            onChange={(e) =>
                                setReportForm((f) => ({ ...f, category: e.target.value as ReportCategory }))
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        >
                            {REPORT_CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={reportForm.subject}
                            onChange={(e) => setReportForm((f) => ({ ...f, subject: e.target.value }))}
                            placeholder="Brief summary of the issue"
                            maxLength={120}
                            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reportForm.description}
                            onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="Describe the issue in detail — include relevant dates, amounts, or observations."
                            rows={4}
                            maxLength={1000}
                            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                        <p className="text-xs text-neutral-400 mt-1 text-right">
                            {reportForm.description.length}/1000
                        </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={() => setReportBooking(null)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitReport}
                            disabled={
                                submittingReport || !reportForm.subject.trim() || !reportForm.description.trim()
                            }
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                        >
                            <MdFlag size={15} />
                            {submittingReport ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default MyCampaigns;
