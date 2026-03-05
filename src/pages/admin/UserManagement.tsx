import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdPeople, MdBlock, MdCheckCircle, MdSearch, MdAdminPanelSettings, MdPerson } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getAllUsers, toggleUserSuspension, updateUserRole, type AdminUser } from '@/services/admin.service';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';

const UserManagement: React.FC = () => {
    const currentUser = useAppSelector(selectUser);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
            } catch {
                toast.error('Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleToggleSuspension = async (uid: string, current: boolean) => {
        try {
            const next = !current;
            await toggleUserSuspension(uid, next);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, suspended: next } : u));
            toast.success(next ? 'User suspended' : 'User reactivated');
        } catch {
            toast.error('Failed to update user status');
        }
    };

    const handlePromoteToAdmin = async (uid: string) => {
        try {
            await updateUserRole(uid, 'admin');
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: 'admin' } : u));
            toast.success('User promoted to admin');
        } catch {
            toast.error('Failed to promote user');
        }
    };

    const handleRevokeAdmin = async (uid: string, originalRole: 'owner' | 'advertiser') => {
        try {
            await updateUserRole(uid, originalRole);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: originalRole } : u));
            toast.success('Admin privileges revoked');
        } catch {
            toast.error('Failed to revoke admin');
        }
    };

    const filtered = users.filter(u => {
        const matchSearch =
            (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    if (loading) {
        return (
            <DashboardLayout userRole="admin" title="User Management" subtitle="View and manage all user accounts">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="p-6"><div className="h-16 bg-neutral-200 rounded" /></Card>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    const roleBadge = (role: string) => {
        if (role === 'admin') return 'bg-purple-100 text-purple-700';
        if (role === 'owner') return 'bg-blue-100 text-blue-700';
        return 'bg-green-100 text-green-700';
    };

    return (
        <DashboardLayout userRole="admin" title="User Management" subtitle="View and manage all user accounts">
            <div className="space-y-6">
                {/* Filters */}
                <Card className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <MdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white w-full md:w-auto"
                        >
                            <option value="all">All Roles</option>
                            <option value="owner">Owners</option>
                            <option value="advertiser">Advertisers</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                </Card>

                {/* Stats chips */}
                <div className="flex gap-3 flex-wrap">
                    {['all', 'owner', 'advertiser', 'admin'].map(r => {
                        const count = r === 'all' ? users.length : users.filter(u => u.role === r).length;
                        return (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${roleFilter === r ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'}`}
                            >
                                {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Users Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px]">
                            <thead>
                                <tr className="border-b border-neutral-200">
                                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-neutral-500">User</th>
                                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-neutral-500">Role</th>
                                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-neutral-500">Status</th>
                                    <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-neutral-500">Joined</th>
                                    <th className="text-right py-4 px-4 sm:px-6 text-sm font-medium text-neutral-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u) => {
                                    const isSelf = u.uid === currentUser?.uid;
                                    return (
                                        <motion.tr
                                            key={u.uid}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                                        >
                                            <td className="py-4 px-4 sm:px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {(u.displayName || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-neutral-900 text-sm">
                                                            {u.displayName || 'Unknown'}
                                                            {isSelf && <span className="ml-2 text-xs text-primary-500">(you)</span>}
                                                        </p>
                                                        <p className="text-xs text-neutral-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 sm:px-6">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleBadge(u.role)}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 sm:px-6">
                                                <span className={`flex items-center gap-1.5 text-xs font-medium ${u.suspended ? 'text-red-600' : 'text-green-600'}`}>
                                                    {u.suspended ? <MdBlock size={14} /> : <MdCheckCircle size={14} />}
                                                    {u.suspended ? 'Suspended' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 sm:px-6 text-sm text-neutral-500 whitespace-nowrap">
                                                {u.createdAt instanceof Date
                                                    ? u.createdAt.toLocaleDateString()
                                                    : new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4 sm:px-6">
                                                {!isSelf && (
                                                    <div className="flex items-center justify-end gap-2 flex-wrap">
                                                        {/* Suspend / Reactivate */}
                                                        <Button
                                                            variant={u.suspended ? 'primary' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handleToggleSuspension(u.uid, !!u.suspended)}
                                                        >
                                                            {u.suspended ? 'Reactivate' : 'Suspend'}
                                                        </Button>

                                                        {/* Promote / Revoke admin */}
                                                        {u.role !== 'admin' ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                icon={<MdAdminPanelSettings size={16} />}
                                                                onClick={() => handlePromoteToAdmin(u.uid)}
                                                            >
                                                                Make Admin
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                icon={<MdPerson size={16} />}
                                                                onClick={() => handleRevokeAdmin(u.uid, 'advertiser')}
                                                            >
                                                                Revoke Admin
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {filtered.length === 0 && (
                            <div className="text-center py-12">
                                <MdPeople size={48} className="text-neutral-300 mx-auto mb-4" />
                                <p className="text-neutral-500">No users found</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default UserManagement;
