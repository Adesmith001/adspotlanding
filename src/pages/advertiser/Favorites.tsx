import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdFavorite, MdLocationOn, MdStar } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { getUserFavorites, toggleFavorite } from '@/services/billboard.service';
import type { Billboard } from '@/types/billboard.types';
import toast from 'react-hot-toast';

const Favorites: React.FC = () => {
    const user = useAppSelector(selectUser);
    const [favorites, setFavorites] = useState<Billboard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;
            try {
                const data = await getUserFavorites(user.uid);
                setFavorites(data);
            } catch (error) {
                console.error("Error fetching favorites:", error);
                toast.error("Failed to load favorites");
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    const handleRemoveFavorite = async (billboardId: string) => {
        if (!user) return;

        // Optimistic update
        setFavorites((prev) => prev.filter((b) => b.id !== billboardId));

        try {
            await toggleFavorite(user.uid, billboardId);
            toast.success("Removed from favorites");
        } catch (error) {
            console.error("Error removing favorite:", error);
            toast.error("Failed to update favorite");
            // Revert changes could be handled here if needed, but for removal simpler is often fine.
        }
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
                userRole="advertiser"
                title="Favorites"
                subtitle="Your saved billboard listings"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden animate-pulse">
                            <div className="h-48 bg-neutral-200" />
                            <div className="p-4 space-y-3">
                                <div className="h-5 bg-neutral-200 rounded w-3/4" />
                                <div className="h-4 bg-neutral-200 rounded w-1/2" />
                            </div>
                        </Card>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            userRole="advertiser"
            title="Favorites"
            subtitle="Your saved billboard listings"
        >
            {favorites.length === 0 ? (
                <EmptyState
                    icon={<MdFavorite />}
                    title="No Favorites Yet"
                    description="Save billboards you're interested in to quickly find them later. Click the heart icon on any listing to add it to your favorites."
                    actionLabel="Browse Billboards"
                    actionHref="/listings"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((billboard) => (
                        <Card key={billboard.id} className="overflow-hidden group">
                            {/* Image */}
                            <Link to={`/billboards/${billboard.id}`} className="block relative h-48 bg-neutral-100">
                                {billboard.photos.length > 0 ? (
                                    <img
                                        src={billboard.photos[0]}
                                        alt={billboard.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                                        <MdFavorite size={48} className="text-neutral-300" />
                                    </div>
                                )}

                                {/* Remove Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleRemoveFavorite(billboard.id);
                                    }}
                                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors group/btn"
                                >
                                    <MdFavorite size={20} className="text-red-500" />
                                </button>

                                {/* Type Badge */}
                                <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 rounded-full text-xs font-semibold capitalize">
                                    {billboard.type}
                                </span>
                            </Link>

                            {/* Content */}
                            <div className="p-4">
                                <Link to={`/billboards/${billboard.id}`}>
                                    <h3 className="font-bold text-neutral-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                        {billboard.title}
                                    </h3>
                                </Link>

                                <div className="flex items-center gap-1.5 text-neutral-600 mb-3 text-sm">
                                    <MdLocationOn size={14} className="text-neutral-400" />
                                    <span className="line-clamp-1">
                                        {billboard.location.city}, {billboard.location.state}
                                    </span>
                                </div>

                                {/* Specs */}
                                <div className="flex items-center gap-3 text-sm text-neutral-600 mb-3">
                                    <span>
                                        {billboard.dimensions.width}×{billboard.dimensions.height} {billboard.dimensions.unit}
                                    </span>
                                    {billboard.rating > 0 && (
                                        <span className="flex items-center gap-1">
                                            <MdStar size={14} className="text-amber-500" />
                                            {billboard.rating.toFixed(1)}
                                        </span>
                                    )}
                                </div>

                                {/* Price & Action */}
                                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                                    <div>
                                        <p className="text-lg font-bold text-neutral-900">
                                            {formatPrice(billboard.pricing.daily)}
                                        </p>
                                        <p className="text-xs text-neutral-500">per day</p>
                                    </div>
                                    <Link to={`/billboards/${billboard.id}`}>
                                        <Button size="sm">View Details</Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default Favorites;
