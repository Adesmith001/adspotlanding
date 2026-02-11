import React from 'react';
import { MdAnalytics, MdTrendingUp, MdAttachMoney, MdVisibility, MdCalendarToday } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';

const OwnerAnalytics: React.FC = () => {

    // Since we don't have real analytics data yet, show empty state with helpful guidance
    const hasData = false; // This will be true once we have real booking data

    return (
        <DashboardLayout
            userRole="owner"
            title="Analytics"
            subtitle="Track your billboard performance and revenue"
        >
            {!hasData ? (
                <div className="space-y-8">
                    {/* Overview Cards - Empty State */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                    <MdAttachMoney size={24} className="text-green-600" />
                                </div>
                            </div>
                            <p className="text-sm text-neutral-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-neutral-900">₦0</p>
                            <p className="text-xs text-neutral-400 mt-1">This month</p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <MdCalendarToday size={24} className="text-blue-600" />
                                </div>
                            </div>
                            <p className="text-sm text-neutral-500">Total Bookings</p>
                            <p className="text-2xl font-bold text-neutral-900">0</p>
                            <p className="text-xs text-neutral-400 mt-1">All time</p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <MdTrendingUp size={24} className="text-purple-600" />
                                </div>
                            </div>
                            <p className="text-sm text-neutral-500">Utilization Rate</p>
                            <p className="text-2xl font-bold text-neutral-900">0%</p>
                            <p className="text-xs text-neutral-400 mt-1">Days booked / available</p>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <MdVisibility size={24} className="text-amber-600" />
                                </div>
                            </div>
                            <p className="text-sm text-neutral-500">Total Views</p>
                            <p className="text-2xl font-bold text-neutral-900">0</p>
                            <p className="text-xs text-neutral-400 mt-1">Listing page views</p>
                        </Card>
                    </div>

                    {/* Revenue Chart - Empty State */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-neutral-900 mb-6">Revenue Over Time</h3>
                        <div className="h-64 flex flex-col items-center justify-center bg-neutral-50 rounded-xl">
                            <MdTrendingUp size={48} className="text-neutral-300 mb-4" />
                            <p className="text-neutral-500 font-medium">No revenue data yet</p>
                            <p className="text-sm text-neutral-400 mt-1">
                                Revenue charts will appear once you receive bookings
                            </p>
                        </div>
                    </Card>

                    {/* Performance Insights - Empty State */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-neutral-900 mb-6">Top Performing Billboards</h3>
                            <div className="h-48 flex flex-col items-center justify-center bg-neutral-50 rounded-xl">
                                <MdAnalytics size={40} className="text-neutral-300 mb-3" />
                                <p className="text-neutral-500 text-sm">No performance data yet</p>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-neutral-900 mb-6">Bookings by Month</h3>
                            <div className="h-48 flex flex-col items-center justify-center bg-neutral-50 rounded-xl">
                                <MdCalendarToday size={40} className="text-neutral-300 mb-3" />
                                <p className="text-neutral-500 text-sm">No booking data yet</p>
                            </div>
                        </Card>
                    </div>

                    {/* Getting Started Tips */}
                    <Card className="p-6 bg-gradient-to-r from-primary-50 to-accent-50 border-0">
                        <h3 className="text-lg font-bold text-neutral-900 mb-4">💡 Tips to Boost Your Analytics</h3>
                        <ul className="space-y-3 text-sm text-neutral-600">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">1</span>
                                <span>Add high-quality photos to your listings to attract more views</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">2</span>
                                <span>Enable instant booking to reduce friction for advertisers</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">3</span>
                                <span>Price competitively based on location and traffic score</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">4</span>
                                <span>Respond quickly to booking requests to maintain a high rating</span>
                            </li>
                        </ul>
                    </Card>
                </div>
            ) : (
                // This section will be populated when we have real data
                <EmptyState
                    icon={<MdAnalytics />}
                    title="Analytics Coming Soon"
                    description="Detailed analytics and insights will be available once you have booking activity."
                />
            )}
        </DashboardLayout>
    );
};

export default OwnerAnalytics;
