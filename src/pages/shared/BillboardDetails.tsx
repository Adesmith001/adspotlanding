import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MdArrowBack,
    MdDesignServices,
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
    MdUpload,
    MdPictureAsPdf,
} from 'react-icons/md';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/EmptyState';
import GoogleMapPanel from '@/components/GoogleMapPanel';
import StreetViewPanel from '@/components/StreetViewPanel';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser, selectIsAuthenticated } from '@/store/authSlice';
import { getBillboard, createBooking, incrementBillboardViews, getBillboardReviews, toggleFavorite, isBillboardFavorited } from '@/services/billboard.service';
import { startConversation } from '@/services/message.service';
import { syncUserProfile, getUserProfile } from '@/services/user.service';
import type { Billboard, CreativeRequirementType, Review } from '@/types/billboard.types';
import { isPdfFile } from '@/utils/media.utils';
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
    const [creativeRequirementType, setCreativeRequirementType] = useState<CreativeRequirementType>('advertiser_upload');
    const [creativeBrief, setCreativeBrief] = useState('');
    const [designFiles, setDesignFiles] = useState<File[]>([]);
    const [designPreviewUrls, setDesignPreviewUrls] = useState<string[]>([]);

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

        if (creativeRequirementType === 'advertiser_upload' && designFiles.length === 0) {
            toast.error('Upload the design file the owner should review before the campaign starts');
            return;
        }

        if (creativeRequirementType === 'owner_design_service' && creativeBrief.trim().length < 20) {
            toast.error('Describe the design request in more detail so the owner can review it');
            return;
        }

        if (!billboard) return;

        setIsBooking(true);
        const toastId = toast.loading('Processing booking request...');

        try {
            // 1. Create Booking
            await createBooking(
                user.uid,
                user.displayName || 'Advertiser',
                user.email || '',
                {
                    billboardId: billboard.id,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    creativeRequirementType,
                    creativeBrief: creativeRequirementType === 'advertiser_upload'
                        ? (creativeBrief.trim() || 'Advertiser uploaded a ready-to-use design for approval.')
                        : creativeBrief.trim(),
                    designFiles,
                }
            );

            const isInstantBooking = billboard.bookingRules.instantBook;

            toast.success(
                isInstantBooking
                    ? 'Booking created. The owner will review the creative before payment is due.'
                    : 'Booking request sent. Payment will be unlocked after owner approval.',
                { id: toastId },
            );

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

    useEffect(() => () => {
        designPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    }, [designPreviewUrls]);

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

    const handleDesignUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) {
            return;
        }

        const nextFiles = Array.from(files);
        setDesignFiles(nextFiles);
        setDesignPreviewUrls((prev) => {
            prev.forEach((url) => URL.revokeObjectURL(url));
            return nextFiles.map((file) => URL.createObjectURL(file));
        });
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
        <div className="min-h-screen bg-[#f7f7f6]">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-[#f7f7f6] border-b border-neutral-200/60 sticky top-0 z-40"
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
                    className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden mb-8 bg-neutral-200 border border-neutral-100"
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
                                className="flex items-center gap-2 mb-4 flex-wrap"
                            >
                                <motion.span
                                    whileHover={{ scale: 1.05 }}
                                    className="px-3 py-1 bg-neutral-900 text-white rounded-full text-sm font-semibold capitalize"
                                >
                                    {billboard.type}
                                </motion.span>
                                {billboard.hasLighting && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.45 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="px-3 py-1 bg-[#d4f34a] text-green-900 rounded-full text-sm font-semibold flex items-center gap-1"
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
                                        className="px-3 py-1 bg-[#d4f34a] text-green-900 rounded-full text-sm font-semibold"
                                    >
                                        Instant Book
                                    </motion.span>
                                )}
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.55 }}
                                className="text-3xl md:text-5xl font-extrabold text-neutral-900 mb-4 tracking-tight"
                            >
                                {billboard.title}
                            </motion.h1>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="flex items-start sm:items-center gap-2 text-neutral-500 text-lg"
                            >
                                <MdLocationOn size={24} className="text-neutral-400" />
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
                            <div className="bg-white rounded-[2rem] border border-neutral-100 p-6 md:p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-neutral-900 mb-6">Specifications</h2>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-neutral-50 p-4 rounded-2xl">
                                        <p className="text-sm font-medium text-neutral-500 mb-1">Dimensions</p>
                                        <p className="font-bold text-neutral-900 text-lg">
                                            {billboard.dimensions.width}×{billboard.dimensions.height} <span className="text-sm font-medium">{billboard.dimensions.unit}</span>
                                        </p>
                                    </div>
                                    <div className="bg-neutral-50 p-4 rounded-2xl">
                                        <p className="text-sm font-medium text-neutral-500 mb-1">Orientation</p>
                                        <p className="font-bold text-neutral-900 text-lg capitalize">{billboard.orientation}</p>
                                    </div>
                                    <div className="bg-neutral-50 p-4 rounded-2xl">
                                        <p className="text-sm font-medium text-neutral-500 mb-1">Traffic Score</p>
                                        <p className="font-bold text-neutral-900 text-lg flex items-center gap-1">
                                            <MdTrendingUp size={20} className="text-[#d4f34a]" />
                                            {billboard.trafficScore}/10
                                        </p>
                                    </div>
                                    <div className="bg-neutral-50 p-4 rounded-2xl">
                                        <p className="text-sm font-medium text-neutral-500 mb-1">Rating</p>
                                        <p className="font-bold text-neutral-900 text-lg flex items-center gap-1">
                                            <MdStar size={20} className="text-amber-400" />
                                            {billboard.rating > 0 ? `${billboard.rating.toFixed(1)} (${billboard.reviewCount})` : 'New'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            <div className="bg-white rounded-[2rem] border border-neutral-100 p-6 md:p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-neutral-900 mb-4">About This Billboard</h2>
                                <p className="text-neutral-600 leading-relaxed text-lg">{billboard.description}</p>
                            </div>
                        </motion.div>

                        {/* Location Map */}
                        {(billboard.location.lat !== 0 || billboard.location.lng !== 0 || billboard.location.address) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.72 }}
                            >
                                <div className="bg-white rounded-[2rem] border border-neutral-100 p-6 md:p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                                        <MdLocationOn size={24} className="text-neutral-400" />
                                        Billboard Location
                                    </h2>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {billboard.location.lat !== 0 && billboard.location.lng !== 0 && (
                                            <GoogleMapPanel
                                                latitude={billboard.location.lat}
                                                longitude={billboard.location.lng}
                                                title="Billboard Location"
                                                subtitle="Review the exact placement on Google Maps before booking."
                                                heightClassName="h-[350px]"
                                            />
                                        )}

                                        <StreetViewPanel
                                            latitude={billboard.location.lat !== 0 ? billboard.location.lat : undefined}
                                            longitude={billboard.location.lng !== 0 ? billboard.location.lng : undefined}
                                            addressFallback={[
                                                billboard.location.address,
                                                billboard.location.city,
                                                billboard.location.state,
                                                billboard.location.country,
                                            ].filter(Boolean).join(', ')}
                                            title="Street-Level View"
                                            subtitle="See the billboard from the road instead of relying on the pin alone."
                                            heightClassName="h-[350px]"
                                        />
                                    </div>
                                    {billboard.location.lat !== 0 && billboard.location.lng !== 0 && (
                                        <p className="text-xs text-neutral-400 mt-4 font-mono">
                                            Lat: {billboard.location.lat.toFixed(6)} • Lng: {billboard.location.lng.toFixed(6)}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Owner Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.75 }}
                        >
                            <div className="bg-white rounded-[2rem] border border-neutral-100 p-6 md:p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-neutral-900 mb-6">Billboard Owner</h2>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xl font-bold">
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
                                        <Button variant="outline" icon={<MdMessage />} onClick={handleContact} className="!rounded-xl">
                                            Contact
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Reviews */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        >
                            <div className="bg-white rounded-[2rem] border border-neutral-100 p-6 md:p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-neutral-900 mb-6">
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
                            </div>
                        </motion.div>
                    </div>

                    {/* Booking Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.85 }}
                        className="lg:col-span-1 w-full mt-8 lg:mt-0"
                    >
                        <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-6 lg:p-8 shadow-sm lg:sticky lg:top-24">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.86 }}
                                className="mb-6"
                            >
                                <p className="text-lg text-neutral-500 mb-1">Price per day</p>
                                <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900">
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

                                <div className="rounded-[1.5rem] border border-neutral-100 bg-neutral-50 p-5 space-y-4">
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900">Creative Requirements</p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            The owner reviews the creative first. Payment is only requested after that approval.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setCreativeRequirementType('advertiser_upload')}
                                            className={`rounded-2xl border-2 p-4 text-left transition-all ${creativeRequirementType === 'advertiser_upload'
                                                ? 'border-neutral-900 bg-white shadow-sm'
                                                : 'border-transparent bg-neutral-100 hover:bg-neutral-200/50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 rounded-lg bg-[#d4f34a] p-2 text-green-900">
                                                    <MdUpload size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-neutral-900">I already have a design</p>
                                                    <p className="text-xs text-neutral-500 mt-1">Upload artwork, mockups, or a PDF proof so the owner can approve it.</p>
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setCreativeRequirementType('owner_design_service')}
                                            className={`rounded-2xl border-2 p-4 text-left transition-all ${creativeRequirementType === 'owner_design_service'
                                                ? 'border-neutral-900 bg-white shadow-sm'
                                                : 'border-transparent bg-neutral-100 hover:bg-neutral-200/50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 rounded-lg bg-neutral-200 p-2 text-neutral-800">
                                                    <MdDesignServices size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-neutral-900">I need the company to create the design</p>
                                                    <p className="text-xs text-neutral-500 mt-1">Explain the campaign, offer, audience, and any brand direction the owner should review.</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>

                                    {creativeRequirementType === 'advertiser_upload' && (
                                        <div className="space-y-3">
                                            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-5 text-center hover:border-primary-400 hover:bg-primary-50/40 transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-800">Upload design files</p>
                                                    <p className="text-xs text-neutral-500 mt-1">PNG, JPG, or PDF files the owner should approve before launch.</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*,application/pdf,.pdf"
                                                    multiple
                                                    onChange={handleDesignUpload}
                                                    className="hidden"
                                                />
                                            </label>

                                            {designPreviewUrls.length > 0 && (
                                                <div className="grid grid-cols-3 gap-2">
                                                    {designPreviewUrls.map((url, index) => {
                                                        const file = designFiles[index];

                                                        if (file && isPdfFile(file)) {
                                                            return (
                                                                <a
                                                                    key={url}
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex h-20 w-full flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2 text-center"
                                                                >
                                                                    <MdPictureAsPdf size={28} className="text-red-600" />
                                                                    <span className="mt-1 line-clamp-2 text-[11px] font-medium text-red-700">
                                                                        {file.name}
                                                                    </span>
                                                                </a>
                                                            );
                                                        }

                                                        return (
                                                            <img
                                                                key={url}
                                                                src={url}
                                                                alt={`Creative upload ${index + 1}`}
                                                                className="h-20 w-full rounded-lg object-cover border border-neutral-200"
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            {creativeRequirementType === 'advertiser_upload' ? 'Additional creative notes' : 'Design brief'}
                                        </label>
                                        <textarea
                                            value={creativeBrief}
                                            onChange={(e) => setCreativeBrief(e.target.value)}
                                            rows={4}
                                            placeholder={creativeRequirementType === 'advertiser_upload'
                                                ? 'Optional: add brand, sizing, print, or placement notes for the owner.'
                                                : 'Describe the offer, target audience, CTA, colours, preferred message, and anything the owner needs to create the design.'}
                                            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                        />
                                    </div>
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
                                        <span className="text-neutral-900">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                            )}

                            <Button fullWidth size="lg" onClick={handleBooking} disabled={isBooking} className="!bg-[#d4f34a] !text-green-900 hover:!bg-[#c5e53a] !rounded-xl font-bold mt-4 shadow-sm">
                                {isBooking ? 'Processing...' : 'Submit For Review'}
                            </Button>

                            <p className="text-xs text-neutral-500 text-center mt-4">
                                {billboard.bookingRules.instantBook
                                    ? 'Instant booking confirms the dates immediately, but payment is still collected only after creative approval.'
                                    : 'This booking requires owner review first, and payment is collected only after the creative is approved.'}
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
                                    <span className="font-bold text-neutral-900">{formatPrice(billboard.pricing.weekly)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-600 font-medium">Monthly rate</span>
                                    <span className="font-bold text-neutral-900">{formatPrice(billboard.pricing.monthly)}</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.main>
        </div >
    );
};

export default BillboardDetails;
