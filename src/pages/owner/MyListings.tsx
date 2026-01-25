import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdMoreVert } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { getOwnerBillboards, deleteBillboard, updateBillboard } from '@/services/billboard.service';
import type { Billboard } from '@/types/billboard.types';
import toast from 'react-hot-toast';

const MyListings: React.FC = () => {
    const user = useAppSelector(selectUser);
    const [billboards, setBillboards] = useState<Billboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        const fetchBillboards = async () => {
            if (!user) return;

            try {
                const data = await getOwnerBillboards(user.uid);
                setBillboards(data);
            } catch (error) {
                console.error('Error fetching billboards:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBillboards();
    }, [user]);

    const handleDelete = async (billboardId: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;

        try {
            await deleteBillboard(billboardId);
            setBillboards((prev) => prev.filter((b) => b.id !== billboardId));
            toast.success('Listing deleted successfully');
        } catch (error) {
            toast.error('Failed to delete listing');
        }
    };

    const handleToggleStatus = async (billboard: Billboard) => {
        const newStatus = billboard.status === 'active' ? 'inactive' : 'active';

        try {
            await updateBillboard(billboard.id, { status: newStatus });
            setBillboards((prev) =>
                prev.map((b) => (b.id === billboard.id ? { ...b, status: newStatus } : b))
            );
            toast.success(`Listing ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to update listing status');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            case 'inactive':
                return 'bg-neutral-100 text-neutral-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-neutral-100 text-neutral-700';
        }
    };

    if (loading) {
        return (
            <DashboardLayout
                userRole="owner"
                title="My Listings"
                subtitle="Manage your billboard inventory"
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
            userRole="owner"
            title="My Listings"
            subtitle="Manage your billboard inventory"
            actions={
                <Link to="/dashboard/owner/create">
                    <Button icon={<MdAdd />}>Add New Listing</Button>
                </Link>
            }
        >
            {billboards.length === 0 ? (
                <EmptyState
                    icon={<MdVisibility />}
                    title="No Listings Yet"
                    description="Create your first billboard listing to start earning from advertisers looking for premium outdoor advertising spaces."
                    actionLabel="Create Your First Listing"
                    actionHref="/dashboard/owner/create"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {billboards.map((billboard) => (
                        <Card key={billboard.id} className="overflow-hidden group">
                            {/* Image */}
                            <div className="relative h-48 bg-neutral-100">
                                {billboard.photos.length > 0 ? (
                                    <img
                                        src={billboard.photos[0]}
                                        alt={billboard.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                                        <MdVisibility size={48} className="text-neutral-300" />
                                    </div>
                                )}

                                {/* Status Badge */}
                                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(billboard.status)}`}>
                                    {billboard.status}
                                </span>

                                {/* Actions Menu */}
                                <div className="absolute top-3 right-3">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === billboard.id ? null : billboard.id)}
                                        className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                                    >
                                        <MdMoreVert size={20} className="text-neutral-700" />
                                    </button>

                                    {activeMenu === billboard.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-10">
                                            <Link
                                                to={`/billboards/${billboard.id}`}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                            >
                                                <MdVisibility size={16} />
                                                View Details
                                            </Link>
                                            <Link
                                                to={`/dashboard/owner/edit/${billboard.id}`}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                            >
                                                <MdEdit size={16} />
                                                Edit Listing
                                            </Link>
                                            <button
                                                onClick={() => handleToggleStatus(billboard)}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                            >
                                                {billboard.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(billboard.id)}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <MdDelete size={16} />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-bold text-neutral-900 mb-1 line-clamp-1">
                                    {billboard.title}
                                </h3>
                                <p className="text-sm text-neutral-600 mb-3 line-clamp-1">
                                    {billboard.location.city}, {billboard.location.state}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-sm mb-3">
                                    <div>
                                        <p className="text-neutral-500">Daily Rate</p>
                                        <p className="font-bold text-neutral-900">{formatPrice(billboard.pricing.daily)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-neutral-500">Views</p>
                                        <p className="font-bold text-neutral-900">{billboard.views || 0}</p>
                                    </div>
                                </div>

                                {/* Bookings Info */}
                                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                                    <span className="text-sm text-neutral-500">
                                        {billboard.totalBookings || 0} bookings
                                    </span>
                                    {billboard.rating > 0 && (
                                        <span className="text-sm text-neutral-900">
                                            ⭐ {billboard.rating.toFixed(1)} ({billboard.reviewCount})
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

export default MyListings;
