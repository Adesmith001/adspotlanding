import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon marker
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error - Icon scaling fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});
import { motion } from 'framer-motion';
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
import { getBillboard, createBooking, incrementBillboardViews, getBillboardReviews, toggleFavorite, isBillboardFavorited } from '@/services/billboard.service';
import { processPayment } from '@/services/payment.service';
import { createNotification } from '@/services/notification.service';
import { startConversation } from '@/services/message.service';
import { syncUserProfile, getUserProfile } from '@/services/user.service';
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

    const handleContact = async () => {
        if (!isAuthenticated || !user) {
            toast.error('Please sign in to contact the owner');
            navigate('/login');
            return;
        }

        if (!billboard) return;

        // Check if user is trying to contact themselves
        if (user.uid === billboard.ownerId) {
            toast.error('You cannot contact yourself');
            return;
        }

        const loadingToast = toast.loading('Starting conversation...');

        try {
            // Ensure current user profile exists
            await syncUserProfile(
                user.uid,
                user.email || '',
                user.displayName || 'User',
                'advertiser' // Default role for users browsing billboards
            );

            // Check if owner profile exists (read-only check, we cannot write to another user's profile)
            await getUserProfile(billboard.ownerId);
            // If owner profile doesn't exist, startConversation will fall back to billboard.ownerName

            // Start a new conversation with the billboard owner
            const conversationId = await startConversation(
                user.uid,
                billboard.ownerId,
                `Hi, I'm interested in your "${billboard.title}" billboard.`
            );

            // Navigate directly to the conversation
            toast.dismiss(loadingToast);
            toast.success('Conversation started!');
            navigate(`/dashboard/advertiser/messages?conversation=${conversationId}`);
        } catch (error) {
            console.error('Error starting conversation:', error);
            toast.dismiss(loadingToast);
            toast.error('Failed to start conversation. Please try again.');
        }
    };

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

            // 2. Process Payment via KoraPay if Instant Book
            if (billboard.bookingRules.instantBook) {
                toast.loading('Launching payment...', { id: toastId });
                await processPayment(
                    bookingId,
                    totalPrice,
                    'korapay',
                    user.uid,
                    billboard.ownerId,
                    billboard.title,
                    user.displayName || 'Advertiser',
                    user.email || '',
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

        } catch (error: any) {
            console.error('Booking failed:', error);
            toast.error(error.message || 'Failed to process booking', { id: toastId });
        } finally {
            setIsBooking(false);
        }
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
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        <div className="h-8 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded w-32" />
                        <div className="h-[500px] bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-3xl shadow-soft" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-8 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded w-3/4" />
                                <div className="h-4 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded w-1/2" />
                            </div>
                            <div className="h-64 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl shadow-soft" />
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (!billboard) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-lg"
                >
                    <EmptyState
                        icon={<MdLocationOn />}
                        title="Billboard Not Found"
                        description="The billboard you're looking for doesn't exist or has been removed."
                        actionLabel="Browse Billboards"
                        actionHref="/listings"
                    />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-40 shadow-soft"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100"
                        >
                            <MdArrowBack size={20} />
                            <span className="font-medium">Back</span>
                        </motion.button>

                        <div className="flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleToggleFavorite}
                                className="p-2.5 rounded-full hover:bg-neutral-100 transition-colors shadow-soft"
                            >
                                {isFavorited ? (
                                    <MdFavorite size={24} className="text-red-500" />
                                ) : (
                                    <MdFavoriteBorder size={24} className="text-neutral-600" />
                                )}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2.5 rounded-full hover:bg-neutral-100 transition-colors shadow-soft"
                            >
                                <MdShare size={24} className="text-neutral-600" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                {/* Photo Gallery */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-neutral-200 to-neutral-300 shadow-card"
                >
                    {billboard.photos.length > 0 ? (
                        <>
                            <motion.img
                                key={currentPhotoIndex}
                                src={billboard.photos[currentPhotoIndex]}
                                alt={billboard.title}
                                className="w-full h-full object-cover"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />

                            {billboard.photos.length > 1 && (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={prevPhoto}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                                    >
                                        <MdChevronLeft size={24} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={nextPhoto}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                                    >
                                        <MdChevronRight size={24} />
                                    </motion.button>

                                    {/* Photo indicators */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.6 }}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
                                    >
                                        {billboard.photos.map((_, index) => (
                                            <motion.button
                                                key={index}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setCurrentPhotoIndex(index)}
                                                className={`h-2 rounded-full transition-all ${index === currentPhotoIndex ? 'bg-white w-6 shadow-lg' : 'bg-white/50 hover:bg-white/70'
                                                    }`}
                                            />
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-neutral-500">No photos available</p>
                        </div>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title & Location */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="flex items-center gap-3 mb-2 flex-wrap"
                            >
                                <motion.span
                                    whileHover={{ scale: 1.05 }}
                                    className="px-3 py-1 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize shadow-soft"
                                >
                                    {billboard.type}
                                </motion.span>
                                {billboard.hasLighting && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.45 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="px-3 py-1 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-1 shadow-soft"
                                    >
                                        <MdLightMode size={14} />
                                        Lit
                                    </motion.span>
                                )}
                                {billboard.bookingRules.instantBook && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="px-3 py-1 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-full text-sm font-medium shadow-soft"
                                    >
                                        Instant Book
                                    </motion.span>
                                )}
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.55 }}
                                className="text-3xl font-bold text-neutral-900 mb-3 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent"
                            >
                                {billboard.title}
                            </motion.h1>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="flex items-start sm:items-center gap-2 text-neutral-600 bg-gradient-to-r from-neutral-50 to-white px-4 py-2 rounded-xl shadow-soft"
                            >
                                <MdLocationOn size={20} className="text-primary-600" />
                                <span className="font-medium break-words">
                                    {billboard.location.address}, {billboard.location.city}, {billboard.location.state}
                                </span>
                            </motion.div>
                        </div>

                        {/* Specifications */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.65 }}
                        >
                            <Card className="p-6 shadow-soft bg-gradient-to-br from-white to-primary-50/50">
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
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            <Card className="p-6 shadow-soft bg-gradient-to-br from-white to-accent-50/50">
                                <h2 className="text-lg font-bold text-neutral-900 mb-4">About This Billboard</h2>
                                <p className="text-neutral-600 leading-relaxed text-justify">{billboard.description}</p>
                            </Card>
                        </motion.div>

                        {/* Location Map */}
                        {billboard.location.lat !== 0 && billboard.location.lng !== 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.72 }}
                            >
                                <Card className="p-6 shadow-soft bg-gradient-to-br from-white to-primary-50/50">
                                    <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                        <MdLocationOn size={20} className="text-primary-600" />
                                        Billboard Location
                                    </h2>
                                    <div className="rounded-2xl overflow-hidden border-2 border-neutral-200 shadow-soft relative z-0">
                                        <MapContainer
                                            center={[billboard.location.lat, billboard.location.lng]}
                                            zoom={16}
                                            scrollWheelZoom={false}
                                            style={{ height: '350px', width: '100%' }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[billboard.location.lat, billboard.location.lng]}>
                                                <Popup>
                                                    <div className="max-w-[200px] p-0">
                                                        <h4 className="font-bold text-sm text-neutral-900 mb-1 line-clamp-1">
                                                            {billboard.title}
                                                        </h4>
                                                        <p className="text-xs text-neutral-500">
                                                            {billboard.location.address}, {billboard.location.city}
                                                        </p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-3 font-mono">
                                        Lat: {billboard.location.lat.toFixed(6)} • Lng: {billboard.location.lng.toFixed(6)}
                                    </p>
                                </Card>
                            </motion.div>
                        )}

                        {/* Owner Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.75 }}
                        >
                            <Card className="p-6 shadow-soft bg-gradient-to-br from-white to-neutral-50/50">
                                <h2 className="text-lg font-bold text-neutral-900 mb-4">Billboard Owner</h2>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button variant="outline" icon={<MdMessage />} onClick={handleContact}>
                                            Contact
                                        </Button>
                                    </motion.div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Reviews */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        >
                            <Card className="p-6 shadow-soft bg-gradient-to-br from-white to-neutral-50/50">
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
                        </motion.div>
                    </div>

                    {/* Booking Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.85 }}
                        className="lg:col-span-1 w-full mt-8 lg:mt-0"
                    >
                        <Card className="p-6 lg:sticky lg:top-24 shadow-card bg-gradient-to-br from-white to-primary-50/50">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.86 }}
                                className="mb-6"
                            >
                                <p className="text-lg text-neutral-600 mb-1">Price per day</p>
                                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text">
                                    {formatPrice(billboard.pricing.daily)}
                                </p>
                            </motion.div>

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
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.88 }}
                                className="mt-6 pt-6 border-t border-neutral-100 space-y-3 text-sm bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 rounded-2xl"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-600 font-medium">Weekly rate</span>
                                    <span className="font-bold text-primary-600">{formatPrice(billboard.pricing.weekly)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-600 font-medium">Monthly rate</span>
                                    <span className="font-bold text-primary-600">{formatPrice(billboard.pricing.monthly)}</span>
                                </div>
                            </motion.div>
                        </Card>
                    </motion.div>
                </div>
            </motion.main>
        </div >
    );
};

export default BillboardDetails;
