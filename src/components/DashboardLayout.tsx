import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole: 'owner' | 'advertiser';
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    userRole,
    title,
    subtitle,
    actions,
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
            {/* Sidebar */}
            <Sidebar userRole={userRole} />

            {/* Main Content */}
            <main className="lg:pl-72">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-30 shadow-sm">
                    <div className="px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="pl-12 lg:pl-0">
                                <motion.h1
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    className="text-2xl font-bold text-neutral-900"
                                >
                                    {title}
                                </motion.h1>
                                {subtitle && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                                        className="text-sm text-neutral-500 mt-1"
                                    >
                                        {subtitle}
                                    </motion.p>
                                )}
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.15 }}
                                className="flex items-center gap-4"
                            >
                                <NotificationBell />
                                {actions && (
                                    <div className="flex items-center gap-3">
                                        {actions}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
                    className="px-6 lg:px-8 py-8"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default DashboardLayout;
