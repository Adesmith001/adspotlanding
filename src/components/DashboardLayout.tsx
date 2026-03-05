import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import MobileNav from '@/components/MobileNav';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole: 'owner' | 'advertiser' | 'admin';
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    hideHeader?: boolean;
    hideMobileNav?: boolean;
    contentClassName?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    userRole,
    title,
    subtitle,
    actions,
    hideHeader = false,
    hideMobileNav = false,
    contentClassName,
}) => {
    const pageContentClassName = contentClassName || `px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${hideMobileNav ? 'pb-6 lg:pb-8' : 'pb-24 lg:pb-8'}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
            {/* Sidebar */}
            <Sidebar userRole={userRole} />

            {/* Main Content */}
            <main className="lg:pl-72">
                {!hideHeader && (
                    <header className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-30 shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <motion.h1
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, ease: 'easeOut' }}
                                        className="text-xl sm:text-2xl font-bold text-neutral-900"
                                    >
                                        {title}
                                    </motion.h1>
                                    {subtitle && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                                            className="text-sm text-neutral-500 mt-1 pr-2"
                                        >
                                            {subtitle}
                                        </motion.p>
                                    )}
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.15 }}
                                    className="shrink-0"
                                >
                                    <NotificationBell />
                                </motion.div>
                            </div>

                            {actions && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                    className="mt-4 flex flex-wrap items-center gap-3"
                                >
                                    {actions}
                                </motion.div>
                            )}
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
                    className={pageContentClassName}
                >
                    {contentClassName ? children : <div className="mx-auto w-full max-w-7xl">{children}</div>}
                </motion.div>
            </main>

            {!hideMobileNav && <MobileNav userRole={userRole} />}
        </div>
    );
};

export default DashboardLayout;
