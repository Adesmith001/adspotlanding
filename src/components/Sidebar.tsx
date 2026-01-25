import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    MdMenu,
    MdClose,
} from 'react-icons/md';

interface SidebarProps {
    userRole: 'owner' | 'advertiser';
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
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const handleSignOut = async () => {
        await dispatch(signOutUser());
    };

    // Owner navigation items
    const ownerNavItems: NavItem[] = [
        { label: 'Dashboard', href: '/dashboard/owner', icon: <MdDashboard size={20} /> },
        { label: 'My Listings', href: '/dashboard/owner/listings', icon: <MdList size={20} /> },
        { label: 'Create Listing', href: '/dashboard/owner/create', icon: <MdAddCircle size={20} /> },
        { label: 'Bookings', href: '/dashboard/owner/bookings', icon: <MdBookmarkBorder size={20} /> },
        { label: 'Analytics', href: '/dashboard/owner/analytics', icon: <MdAnalytics size={20} /> },
        { label: 'Messages', href: '/dashboard/owner/messages', icon: <MdMessage size={20} /> },
        { label: 'Settings', href: '/dashboard/owner/settings', icon: <MdSettings size={20} /> },
    ];

    // Advertiser navigation items
    const advertiserNavItems: NavItem[] = [
        { label: 'Dashboard', href: '/dashboard/advertiser', icon: <MdDashboard size={20} /> },
        { label: 'Browse Billboards', href: '/listings', icon: <MdList size={20} /> },
        { label: 'My Campaigns', href: '/dashboard/advertiser/campaigns', icon: <MdCampaign size={20} /> },
        { label: 'Favorites', href: '/dashboard/advertiser/favorites', icon: <MdFavorite size={20} /> },
        { label: 'Payments', href: '/dashboard/advertiser/payments', icon: <MdPayment size={20} /> },
        { label: 'Messages', href: '/dashboard/advertiser/messages', icon: <MdMessage size={20} /> },
        { label: 'Settings', href: '/dashboard/advertiser/settings', icon: <MdSettings size={20} /> },
    ];

    const navItems = userRole === 'owner' ? ownerNavItems : advertiserNavItems;

    const isActive = (href: string) => {
        if (href === '/dashboard/owner' || href === '/dashboard/advertiser') {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-neutral-800">
                <Link to="/" className="text-2xl font-bold text-white">
                    Adspot
                </Link>
                <p className="text-xs text-neutral-500 mt-1 capitalize">
                    {userRole === 'owner' ? 'Billboard Owner' : 'Advertiser'}
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                to={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.href)
                                        ? 'bg-primary-600 text-white'
                                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-neutral-800">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
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
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                >
                    <MdLogout size={20} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-neutral-900 text-white rounded-lg"
            >
                <MdMenu size={24} />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-neutral-900 transform transition-transform duration-300 lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white"
                >
                    <MdClose size={24} />
                </button>
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:min-h-screen bg-neutral-900 fixed left-0 top-0 bottom-0">
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;
