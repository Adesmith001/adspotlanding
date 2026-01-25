import React from 'react';
import { Link } from 'react-router-dom';
import { MdLocationOn, MdStar, MdTrendingUp, MdLightMode, MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import type { Billboard } from '@/types/billboard.types';

interface BillboardCardProps {
    billboard: Billboard;
    onFavorite?: (billboardId: string) => void;
    isFavorited?: boolean;
}

const BillboardCard: React.FC<BillboardCardProps> = ({ billboard, onFavorite, isFavorited = false }) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getBillboardTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            flex: 'Flex',
            digital: 'Digital',
            led: 'LED',
        };
        return labels[type] || type;
    };

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-primary-500 hover:shadow-2xl transition-all duration-300">
            {/* Image */}
            <Link to={`/billboards/${billboard.id}`} className="block relative h-64 overflow-hidden bg-neutral-100">
                {billboard.photos.length > 0 ? (
                    <img
                        src={billboard.photos[0]}
                        alt={billboard.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                        <span className="text-neutral-400 text-sm">No image</span>
                    </div>
                )}

                {/* Overlay badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-neutral-900 shadow-lg">
                        {getBillboardTypeLabel(billboard.type)}
                    </span>
                    {billboard.hasLighting && (
                        <span className="px-3 py-1 bg-amber-500/95 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg flex items-center gap-1">
                            <MdLightMode size={12} />
                            Lit
                        </span>
                    )}
                </div>

                {/* Favorite button */}
                {onFavorite && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onFavorite(billboard.id);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                        {isFavorited ? (
                            <MdFavorite className="text-red-500" size={20} />
                        ) : (
                            <MdFavoriteBorder className="text-neutral-600" size={20} />
                        )}
                    </button>
                )}

                {/* Instant book badge */}
                {billboard.bookingRules.instantBook && (
                    <div className="absolute bottom-3 left-3">
                        <span className="px-3 py-1 bg-green-500/95 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-lg">
                            Instant Book
                        </span>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-5">
                {/* Title */}
                <Link to={`/billboards/${billboard.id}`}>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {billboard.title}
                    </h3>
                </Link>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-neutral-600 mb-3">
                    <MdLocationOn size={16} className="text-neutral-400 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">
                        {billboard.location.landmark ? `${billboard.location.landmark}, ` : ''}
                        {billboard.location.city}
                    </span>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-4 mb-4 text-sm text-neutral-600">
                    <div className="flex items-center gap-1">
                        <span className="font-medium text-neutral-900">
                            {billboard.dimensions.width}×{billboard.dimensions.height}
                        </span>
                        <span>{billboard.dimensions.unit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MdTrendingUp size={14} className="text-green-600" />
                        <span className="font-medium text-neutral-900">{billboard.trafficScore}</span>
                        <span className="text-xs">/10</span>
                    </div>
                    {billboard.rating > 0 && (
                        <div className="flex items-center gap-1">
                            <MdStar size={14} className="text-amber-500" />
                            <span className="font-medium text-neutral-900">{billboard.rating.toFixed(1)}</span>
                            <span className="text-xs">({billboard.reviewCount})</span>
                        </div>
                    )}
                </div>

                {/* Owner info */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-neutral-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                        {billboard.ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">{billboard.ownerName}</p>
                        {billboard.ownerVerified && (
                            <p className="text-xs text-green-600">✓ Verified Owner</p>
                        )}
                    </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-neutral-900">
                            {formatPrice(billboard.pricing.daily)}
                        </p>
                        <p className="text-xs text-neutral-500">per day</p>
                    </div>
                    <Link
                        to={`/billboards/${billboard.id}`}
                        className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BillboardCard;
