import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { selectUser, signOutUser } from '@/store/authSlice';
import {
    MdDashboard,
    MdAddCircle,
    MdList,
    MdBookmarkBorder,
    MdAnalytics,
    MdMessage,
    MdSettings,
    MdLogout,
    MdCampaign,
    MdFavorite,
    MdPayment,
    MdPeople,
    MdVerifiedUser,
    MdAdminPanelSettings,
} from 'react-icons/md';

interface SidebarProps {
    userRole: 'owner' | 'advertiser' | 'admin';
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);

    const handleSignOut = async () => {
        await dispatch(signOutUser());
    };

    const ownerNavItems: NavItem[] = [
        { label: 'Dashboard', href: '/dashboard/owner', icon: <MdDashboard size={20} /> },
        { label: 'My Listings', href: '/dashboard/owner/listings', icon: <MdList size={20} /> },
        { label: 'Create Listing', href: '/dashboard/owner/create', icon: <MdAddCircle size={20} /> },
        { label: 'Bookings', href: '/dashboard/owner/bookings', icon: <MdBookmarkBorder size={20} /> },
        { label: 'Analytics', href: '/dashboard/owner/analytics', icon: <MdAnalytics size={20} /> },
        { label: 'Messages', href: '/dashboard/owner/messages', icon: <MdMessage size={20} /> },
        { label: 'Settings', href: '/dashboard/owner/settings', icon: <MdSettings size={20} /> },
    ];

    const advertiserNavItems: NavItem[] = [
        { label: 'Dashboard', href: '/dashboard/advertiser', icon: <MdDashboard size={20} /> },
        { label: 'Browse Billboards', href: '/listings', icon: <MdList size={20} /> },
        { label: 'My Campaigns', href: '/dashboard/advertiser/campaigns', icon: <MdCampaign size={20} /> },
        { label: 'Favorites', href: '/dashboard/advertiser/favorites', icon: <MdFavorite size={20} /> },
        { label: 'Payments', href: '/dashboard/advertiser/payments', icon: <MdPayment size={20} /> },
        { label: 'Messages', href: '/dashboard/advertiser/messages', icon: <MdMessage size={20} /> },
        { label: 'Settings', href: '/dashboard/advertiser/settings', icon: <MdSettings size={20} /> },
    ];

    const adminNavItems: NavItem[] = [
        { label: 'Dashboard', href: '/dashboard/admin', icon: <MdAdminPanelSettings size={20} /> },
        { label: 'User Management', href: '/dashboard/admin/users', icon: <MdPeople size={20} /> },
        { label: 'Listing Verification', href: '/dashboard/admin/listings', icon: <MdVerifiedUser size={20} /> },
        { label: 'Transactions', href: '/dashboard/admin/transactions', icon: <MdPayment size={20} /> },
        { label: 'Settings', href: '/dashboard/admin/settings', icon: <MdSettings size={20} /> },
    ];

    const navItems = userRole === 'owner' ? ownerNavItems : userRole === 'admin' ? adminNavItems : advertiserNavItems;

    const isActive = (href: string) => {
        if (href === '/dashboard/owner' || href === '/dashboard/advertiser' || href === '/dashboard/admin') {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };

    return (
        // Desktop only — mobile uses MobileNav bottom bar
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:min-h-screen bg-neutral-900 fixed left-0 top-0 bottom-0">
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="p-6 border-b border-neutral-800/50">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="text-2xl font-bold text-white">dspot</span>
                    </Link>
                    <p className="text-xs text-neutral-500 mt-2 capitalize">
                        {userRole === 'owner' ? 'Billboard Owner' : userRole === 'admin' ? 'Administrator' : 'Advertiser'}
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <li key={item.href}>
                                    <Link
                                        to={item.href}
                                        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                                            ? 'text-white'
                                            : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
                                            }`}
                                    >
                                        {active && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl shadow-lg shadow-primary-500/20"
                                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10">{item.icon}</span>
                                        <span className="relative z-10 font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-neutral-800/50">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold ring-2 ring-neutral-700/50 ring-offset-2 ring-offset-neutral-900">
                            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                    >
                        <MdLogout size={20} />
                        <span className="font-medium">Sign Out</span>
                    </motion.button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
