import React from 'react';
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
        <div className="min-h-screen bg-neutral-50">
            {/* Sidebar */}
            <Sidebar userRole={userRole} />

            {/* Main Content */}
            <main className="lg:pl-72">
                {/* Header */}
                <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
                    <div className="px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="pl-12 lg:pl-0">
                                <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
                                {subtitle && (
                                    <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <NotificationBell />
                                {actions && (
                                    <div className="flex items-center gap-3">
                                        {actions}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
