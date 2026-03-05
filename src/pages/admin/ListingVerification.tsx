import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdVerifiedUser, MdCheckCircle, MdCancel, MdSearch, MdFilterList } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getAllBillboards, updateBillboardAdminStatus, type AdminBillboard } from '@/services/admin.service';
import toast from 'react-hot-toast';

const ListingVerification: React.FC = () => {
    const [billboards, setBillboards] = useState<AdminBillboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchBillboards = async () => {
            try {
                const data = await getAllBillboards();
                setBillboards(data);
            } catch (error) {
                console.error('Error fetching billboards:', error);
                toast.error('Failed to load listings');
            } finally {
                setLoading(false);
            }
        };
        fetchBillboards();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await updateBillboardAdminStatus(id, 'active');
            setBillboards(billboards.map((b) => (b.id === id ? { ...b, status: 'active' } : b)));
            toast.success('Billboard approved!');
        } catch (error) {
            toast.error('Failed to approve billboard');
        }
    };

    const handleReject = async (id: string) => {
        try {
            await updateBillboardAdminStatus(id, 'rejected');
            setBillboards(billboards.map((b) => (b.id === id ? { ...b, status: 'rejected' } : b)));
            toast.success('Billboard rejected');
        } catch (error) {
            toast.error('Failed to reject billboard');
        }
    };

    const filtered = billboards.filter((b) => {
        const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.ownerName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-700',
            pending: 'bg-amber-100 text-amber-700',
            rejected: 'bg-red-100 text-red-700',
            inactive: 'bg-neutral-100 text-neutral-700',
        };
        return styles[status] || 'bg-neutral-100 text-neutral-700';
    };

    if (loading) {
        return (
            <DashboardLayout userRole="admin" title="Listing Verification" subtitle="Review and approve billboard listings">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6"><div className="h-20 bg-neutral-200 rounded" /></Card>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userRole="admin" title="Listing Verification" subtitle="Review and approve billboard listings">
            <div className="space-y-6">
                {/* Filters */}
                <Card className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <MdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search by title or owner..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <MdFilterList size={20} className="text-neutral-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white w-full md:w-auto"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Listings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filtered.map((billboard) => (
                        <motion.div
                            key={billboard.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                    <div>
                                        <h3 className="font-bold text-neutral-900">{billboard.title}</h3>
                                        <p className="text-sm text-neutral-500">{billboard.location?.city}, {billboard.location?.state}</p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            by {billboard.ownerName} • {billboard.type} •{' '}
                                            {billboard.createdAt instanceof Date ? billboard.createdAt.toLocaleDateString() : new Date(billboard.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(billboard.status)}`}>
                                        {billboard.status}
                                    </span>
                                </div>

                                {billboard.status === 'pending' && (
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-100">
                                        <Button
                                            size="sm"
                                            icon={<MdCheckCircle />}
                                            onClick={() => handleApprove(billboard.id)}
                                            className="flex-1"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            icon={<MdCancel />}
                                            onClick={() => handleReject(billboard.id)}
                                            className="flex-1"
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <Card className="p-12 text-center">
                        <MdVerifiedUser size={48} className="text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-500 font-medium">No listings found</p>
                        <p className="text-sm text-neutral-400 mt-1">All listings matching your filters will appear here</p>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ListingVerification;
