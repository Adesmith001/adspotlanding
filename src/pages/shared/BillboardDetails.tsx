import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MdArrowBack,
    MdLocationOn,
    MdStar,
    MdLightMode,
    MdTrendingUp,
    MdVerified,
    MdFavorite,
    MdFavoriteBorder,
    MdShare,
    MdMessage,
    MdChevronLeft,
    MdChevronRight,
} from 'react-icons/md';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/EmptyState';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser, selectIsAuthenticated } from '@/store/authSlice';
import { getBillboard, incrementBillboardViews, getBillboardReviews, createBooking, toggleFavorite, isBillboardFavorited } from '@/services/billboard.service';
import { createNotification } from '@/services/notification.service';
import { processPayment } from '@/services/payment.service';
import type { Billboard, Review } from '@/types/billboard.types';
import toast from 'react-hot-toast';

const BillboardDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const [billboard, setBillboard] = useState<Billboard | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    // Booking form state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bookingDuration, setBookingDuration] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                // Fetch billboard first - this is critical for the page to work
                const billboardData = await getBillboard(id);

                if (billboardData) {
                    setBillboard(billboardData);
                    incrementBillboardViews(id); // Track view
                }

                // Fetch reviews separately - don't let review failures block the page
                try {
                    const reviewsData = await getBillboardReviews(id);
                    setReviews(reviewsData);
                } catch (reviewError) {
                    console.error('Error fetching reviews (non-critical):', reviewError);
                    // Reviews failed but billboard should still display
                    setReviews([]);
                }
            } catch (error) {
                console.error('Error fetching billboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Calculate price when dates change
    useEffect(() => {
        if (startDate && endDate && billboard) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            if (days > 0) {
                setBookingDuration(days);

                let price = 0;
                if (days >= 30) {
                    price = billboard.pricing.monthly * Math.ceil(days / 30);
                } else if (days >= 7) {
                    price = billboard.pricing.weekly * Math.ceil(days / 7);
                } else {
                    price = billboard.pricing.daily * days;
                }
                setTotalPrice(price);
            } else {
                setBookingDuration(0);
                setTotalPrice(0);
            }
        }
    }, [startDate, endDate, billboard]);

    const handleBooking = async () => {
        if (!isAuthenticated || !user) {
            toast.error('Please sign in to book this billboard');
            navigate('/login');
            return;
        }

        if (!startDate || !endDate) {
            toast.error('Please select booking dates');
            return;
        }

        if (!billboard) return;

        // Temporarily disable booking processing
        toast.error('Failed to process booking');
        return;

        // TODO: Re-enable after payment integration is complete
        /*
        setIsBooking(true);
        const toastId = toast.loading('Processing booking request...');

        try {
            // 1. Create Booking
            const bookingId = await createBooking(
                user.uid,
                user.displayName || 'Advertiser',
                user.email || '',
                {
                    billboardId: billboard.id,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                }
            );

            // 2. Mock Payment if Instant Book
            if (billboard.bookingRules.instantBook) {
                toast.loading('Processing payment...', { id: toastId });
                await processPayment(
                    bookingId,
                    totalPrice,
                    'card',
                    user.uid,
                    billboard.ownerId,
                    billboard.title
                );

                toast.success('Booking confirmed & paid!', { id: toastId });
            } else {
                // 3. Notify Owner of Request (if not instant booked)
                await createNotification(
                    billboard.ownerId,
                    'booking_request',
                    'New Booking Request',
                    `${user.displayName} requested to book "${billboard.title}" for ${bookingDuration} days.`,
                    { bookingId, billboardId: billboard.id },
                    '/dashboard/owner/bookings'
                );

                toast.success('Booking request sent!', { id: toastId });
            }

            // Redirect to campaigns
            navigate('/dashboard/advertiser/campaigns');

        } catch (error) {
            console.error('Booking failed:', error);
            toast.error('Failed to process booking', { id: toastId });
        } finally {
            setIsBooking(false);
        }
        */
    };

    // Load initial favorite status
    useEffect(() => {
        const loadFavoriteStatus = async () => {
            if (!user || !id) return;
            try {
                const favorited = await isBillboardFavorited(user.uid, id);
                setIsFavorited(favorited);
            } catch (err) {
                console.error('Error loading favorite status:', err);
            }
        };

        loadFavoriteStatus();
    }, [user, id]);

    const handleToggleFavorite = async () => {
        if (!isAuthenticated || !user) {
            toast.error('Please sign in to save favorites');
            return;
        }

        if (!id) return;

        // Optimistic update
        setIsFavorited(!isFavorited);

        try {
            const newFavorited = await toggleFavorite(user.uid, id);
            toast.success(newFavorited ? 'Added to favorites' : 'Removed from favorites');
        } catch (err) {
            // Revert on error
            setIsFavorited(!isFavorited);
            toast.error('Failed to update favorite');
            console.error('Error toggling favorite:', err);
        }
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
            month: 'long',
            year: 'numeric',
        });
    };

    const nextPhoto = () => {
        if (billboard && billboard.photos.length > 0) {
            setCurrentPhotoIndex((prev) => (prev + 1) % billboard.photos.length);
        }
    };

    const prevPhoto = () => {
        if (billboard && billboard.photos.length > 0) {
            setCurrentPhotoIndex((prev) => (prev - 1 + billboard.photos.length) % billboard.photos.length);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-neutral-200 rounded w-32" />
                        <div className="h-[500px] bg-neutral-200 rounded-2xl" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-8 bg-neutral-200 rounded w-3/4" />
                                <div className="h-4 bg-neutral-200 rounded w-1/2" />
                            </div>
                            <div className="h-64 bg-neutral-200 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!billboard) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <EmptyState
                    icon={<MdLocationOn />}
                    title="Billboard Not Found"
                    description="The billboard you're looking for doesn't exist or has been removed."
                    actionLabel="Browse Billboards"
                    actionHref="/listings"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
                        >
                            <MdArrowBack size={20} />
                            <span>Back</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleToggleFavorite}
                                className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                            >
                                {isFavorited ? (
                                    <MdFavorite size={24} className="text-red-500" />
                                ) : (
                                    <MdFavoriteBorder size={24} className="text-neutral-600" />
                                )}
                            </button>
                            <button className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
                                <MdShare size={24} className="text-neutral-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Photo Gallery */}
                <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8 bg-neutral-200">
                    {billboard.photos.length > 0 ? (
                        <>
                            <img
                                src={billboard.photos[currentPhotoIndex]}
                                alt={billboard.title}
                                className="w-full h-full object-cover"
                            />

                            {billboard.photos.length > 1 && (
                                <>
                                    <button
                                        onClick={prevPhoto}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                                    >
                                        <MdChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextPhoto}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                                    >
                                        <MdChevronRight size={24} />
                                    </button>

                                    {/* Photo indicators */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {billboard.photos.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentPhotoIndex(index)}
                                                className={`w-2 h-2 rounded-full transition-all ${index === currentPhotoIndex ? 'bg-white w-6' : 'bg-white/50'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-neutral-500">No photos available</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title & Location */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
                                    {billboard.type}
                                </span>
                                {billboard.hasLighting && (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-1">
                                        <MdLightMode size={14} />
                                        Lit
                                    </span>
                                )}
                                {billboard.bookingRules.instantBook && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        Instant Book
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl font-bold text-neutral-900 mb-3">{billboard.title}</h1>

                            <div className="flex items-center gap-2 text-neutral-600">
                                <MdLocationOn size={20} className="text-neutral-400" />
                                <span>
                                    {billboard.location.address}, {billboard.location.city}, {billboard.location.state}
                                </span>
                            </div>
                        </div>

                        {/* Specifications */}
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-neutral-900 mb-4">Specifications</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">Dimensions</p>
                                    <p className="font-bold text-neutral-900">
                                        {billboard.dimensions.width}×{billboard.dimensions.height} {billboard.dimensions.unit}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">Orientation</p>
                                    <p className="font-bold text-neutral-900 capitalize">{billboard.orientation}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">Traffic Score</p>
                                    <p className="font-bold text-neutral-900 flex items-center gap-1">
                                        <MdTrendingUp size={16} className="text-green-600" />
                                        {billboard.trafficScore}/10
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">Rating</p>
                                    <p className="font-bold text-neutral-900 flex items-center gap-1">
                                        <MdStar size={16} className="text-amber-500" />
                                        {billboard.rating > 0 ? `${billboard.rating.toFixed(1)} (${billboard.reviewCount})` : 'New'}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Description */}
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-neutral-900 mb-4">About This Billboard</h2>
                            <p className="text-neutral-600 leading-relaxed">{billboard.description}</p>
                        </Card>

                        {/* Owner Info */}
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-neutral-900 mb-4">Billboard Owner</h2>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
                                        {billboard.ownerName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-neutral-900 flex items-center gap-2">
                                            {billboard.ownerName}
                                            {billboard.ownerVerified && (
                                                <MdVerified size={18} className="text-green-600" />
                                            )}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            {billboard.totalBookings} successful bookings
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" icon={<MdMessage />}>
                                    Contact
                                </Button>
                            </div>
                        </Card>

                        {/* Reviews */}
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-neutral-900 mb-4">
                                Reviews ({reviews.length})
                            </h2>
                            {reviews.length === 0 ? (
                                <p className="text-neutral-500 text-center py-8">
                                    No reviews yet. Be the first to review after your campaign!
                                </p>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold">
                                                    {review.advertiserName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900">{review.advertiserName}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <MdStar
                                                                    key={star}
                                                                    size={14}
                                                                    className={star <= review.rating ? 'text-amber-500' : 'text-neutral-200'}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-neutral-500">
                                                            {formatDate(review.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-neutral-600">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-24">
                            <div className="mb-6">
                                <p className="text-3xl font-bold text-neutral-900">
                                    {formatPrice(billboard.pricing.daily)}
                                </p>
                                <p className="text-neutral-500">per day</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate || new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            {bookingDuration > 0 && (
                                <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-neutral-600">Duration</span>
                                        <span className="font-medium text-neutral-900">{bookingDuration} days</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span className="text-neutral-900">Total</span>
                                        <span className="text-primary-600">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                            )}

                            <Button fullWidth size="lg" onClick={handleBooking} disabled={isBooking}>
                                {isBooking ? 'Processing...' : (billboard.bookingRules.instantBook ? 'Book Now' : 'Request Booking')}
                            </Button>

                            <p className="text-xs text-neutral-500 text-center mt-4">
                                {billboard.bookingRules.instantBook
                                    ? 'Instant booking available. You will be charged immediately.'
                                    : 'This booking requires owner approval.'}
                            </p>

                            {/* Pricing Info */}
                            <div className="mt-6 pt-6 border-t border-neutral-100 space-y-2 text-sm">
                                <div className="flex justify-between text-neutral-600">
                                    <span>Weekly rate</span>
                                    <span className="font-medium">{formatPrice(billboard.pricing.weekly)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-600">
                                    <span>Monthly rate</span>
                                    <span className="font-medium">{formatPrice(billboard.pricing.monthly)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div >
    );
};

export default BillboardDetails;
