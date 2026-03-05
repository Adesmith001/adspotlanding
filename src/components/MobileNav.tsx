import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { selectUser, signOutUser } from '@/store/authSlice';
import {
    MdDashboard, MdAddCircle, MdList, MdBookmarkBorder, MdAnalytics, MdMessage,
    MdSettings, MdLogout, MdCampaign, MdFavorite, MdPayment, MdClose,
    MdPeople, MdVerifiedUser, MdAdminPanelSettings, MdGridView,
} from 'react-icons/md';

interface MobileNavProps {
    userRole: 'owner' | 'advertiser' | 'admin';
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const MobileNav: React.FC<MobileNavProps> = ({ userRole }) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const [moreOpen, setMoreOpen] = useState(false);

    const ownerAllItems: NavItem[] = [
        { label: 'Dashboard', href: '/dashboard/owner', icon: <MdDashboard size={22} /> },
        { label: 'Listings', href: '/dashboard/owner/listings', icon: <MdList size={22} /> },
        { label: 'Create', href: '/dashboard/owner/create', icon: <MdAddCircle size={22} /> },
        { label: 'Bookings', href: '/dashboard/owner/bookings', icon: <MdBookmarkBorder size={22} /> },
        { label: 'Analytics', href: '/dashboard/owner/analytics', icon: <MdAnalytics size={22} /> },
        { label: 'Messages', href: '/dashboard/owner/messages', icon: <MdMessage size={22} /> },
        { label: 'Settings', href: '/dashboard/owner/settings', icon: <MdSettings size={22} /> },
    ];

    const advertiserAllItems: NavItem[] = [
        { label: 'Dashboard', href: '/dashboard/advertiser', icon: <MdDashboard size={22} /> },
        { label: 'Explore', href: '/listings', icon: <MdList size={22} /> },
        { label: 'Campaigns', href: '/dashboard/advertiser/campaigns', icon: <MdCampaign size={22} /> },
        { label: 'Favorites', href: '/dashboard/advertiser/favorites', icon: <MdFavorite size={22} /> },
        { label: 'Payments', href: '/dashboard/advertiser/payments', icon: <MdPayment size={22} /> },
        { label: 'Messages', href: '/dashboard/advertiser/messages', icon: <MdMessage size={22} /> },
        { label: 'Settings', href: '/dashboard/advertiser/settings', icon: <MdSettings size={22} /> },
    ];

    const adminAllItems: NavItem[] = [
        { label: 'Overview', href: '/dashboard/admin', icon: <MdAdminPanelSettings size={22} /> },
        { label: 'Users', href: '/dashboard/admin/users', icon: <MdPeople size={22} /> },
        { label: 'Verify', href: '/dashboard/admin/listings', icon: <MdVerifiedUser size={22} /> },
        { label: 'Payments', href: '/dashboard/admin/transactions', icon: <MdPayment size={22} /> },
        { label: 'Settings', href: '/dashboard/admin/settings', icon: <MdSettings size={22} /> },
    ];

    const allItems = userRole === 'owner' ? ownerAllItems : userRole === 'admin' ? adminAllItems : advertiserAllItems;

    // Show 4 primary items in bar, rest go in "More"
    const primaryItems = allItems.slice(0, 4);
    const moreItems = allItems.slice(4);

    const handleSignOut = () => {
        dispatch(signOutUser());
        setMoreOpen(false);
    };

    return (
        <>
            {/* More Sheet Overlay */}
            <AnimatePresence>
                {moreOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setMoreOpen(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl pb-36"
                        >
                            {/* Handle bar */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-neutral-300" />
                            </div>

                            {/* User info */}
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900">{user?.displayName || 'User'}</p>
                                    <p className="text-xs text-neutral-500">{user?.email}</p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setMoreOpen(false)}
                                    className="ml-auto p-2 rounded-full bg-neutral-100 text-neutral-600"
                                >
                                    <MdClose size={20} />
                                </motion.button>
                            </div>

                            {/* Extra nav items */}
                            <div className="px-4 py-3 grid grid-cols-3 gap-2">
                                {moreItems.map((item) => (
                                    <NavLink
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => setMoreOpen(false)}
                                        className={({ isActive }) =>
                                            `flex flex-col items-center gap-1.5 p-4 rounded-2xl transition-all duration-200 ${isActive
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                                            }`
                                        }
                                    >
                                        {item.icon}
                                        <span className="text-xs font-semibold">{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>

                            {/* Sign out */}
                            <div className="px-4 pb-4 mt-2 border-t border-neutral-100 pt-3">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
                                >
                                    <MdLogout size={22} />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Bar */}
            <motion.nav
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-3 pb-5 pt-1"
            >
                <div className="bg-white/75 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl flex items-center justify-around px-2 py-2">
                    {primaryItems.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.href === '/dashboard/owner' || item.href === '/dashboard/advertiser' || item.href === '/dashboard/admin'}
                            className={({ isActive }) =>
                                `relative flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-300 min-w-[56px] ${isActive ? 'text-primary-600' : 'text-neutral-500'}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobile-pill"
                                            className="absolute inset-0 bg-primary-50 rounded-xl"
                                            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                                        />
                                    )}
                                    <span className="relative z-10">{item.icon}</span>
                                    <span className="relative z-10 text-[10px] font-bold tracking-tight">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* More button */}
                    {moreItems.length > 0 && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setMoreOpen(true)}
                            className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl min-w-[56px] text-neutral-500 hover:text-neutral-800 transition-colors"
                        >
                            <MdGridView size={22} />
                            <span className="text-[10px] font-bold tracking-tight">More</span>
                        </motion.button>
                    )}
                </div>
            </motion.nav>
        </>
    );
};

export default MobileNav;
