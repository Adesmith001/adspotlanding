import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MdPerson,
    MdSecurity,
    MdNotifications,
    MdPayment,
    MdSave,
    MdCreditCard,
    MdHistory,
    MdEdit,
    MdAdd
} from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { getUserProfile, updateUserProfile, updateUserPreferences, syncUserProfile } from '@/services/user.service';
import { getPaymentHistory } from '@/services/payment.service';
import type { PaymentTransaction } from '@/services/payment.service';
import toast from 'react-hot-toast';

interface SettingsProps {
    userRole: 'owner' | 'advertiser';
}

type SettingsTab = 'profile' | 'security' | 'notifications' | 'billing';

const Settings: React.FC<SettingsProps> = ({ userRole }) => {
    const user = useAppSelector(selectUser);
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Profile Form State
    const [profileData, setProfileData] = useState({
        displayName: '',
        email: '',
        phone: '',
        bio: '',
        company: '',
        website: ''
    });

    // Notification Preferences State
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: false,
        newBookings: true,
        marketingUpdates: false,
        securityAlerts: true
    });

    // Payment History State
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);

    // Fetch User Data
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            // 1. Profile Data
            try {
                // Sync User Profile (Ensure it exists)
                await syncUserProfile(user.uid, user.email || '', user.displayName || '', userRole);

                // Get User Profile
                const profile = await getUserProfile(user.uid);
                if (profile) {
                    setProfileData({
                        displayName: profile.displayName || user.displayName || '',
                        email: profile.email || user.email || '',
                        phone: profile.phoneNumber || '',
                        bio: profile.bio || '',
                        company: profile.company || '',
                        website: profile.website || ''
                    });

                    if (profile.preferences) {
                        setNotifications(prev => ({ ...prev, ...profile.preferences }));
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                toast.error('Failed to load profile details');
            }

            // 2. Payment History
            try {
                const history = await getPaymentHistory(user.uid, userRole);
                setPayments(history);
            } catch (error) {
                console.error('Error loading payments:', error);
                // Don't show toast for payments if it fails silently (e.g. index missing)
                // or show a less intrusive warning
                console.warn('Payment history could not be loaded. This might be due to a missing Firestore index.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, userRole]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await updateUserProfile(user.uid, {
                displayName: profileData.displayName,
                phoneNumber: profileData.phone,
                bio: profileData.bio,
                company: profileData.company,
                website: profileData.website
            });
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    const handlePreferenceUpdate = async (key: string, value: boolean) => {
        if (!user) return;

        // Update local state immediately for UI responsiveness
        const updatedPrefs = { ...notifications, [key]: value };
        setNotifications(updatedPrefs);

        try {
            await updateUserPreferences(user.uid, { [key]: value });
        } catch (error) {
            console.error('Error updating preferences:', error);
            toast.error('Failed to save preference');
            // Revert on error
            setNotifications(prev => ({ ...prev, [key]: !value }));
        }
    };

    const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { id: 'profile', label: 'Profile', icon: <MdPerson size={20} /> },
        { id: 'security', label: 'Security', icon: <MdSecurity size={20} /> },
        { id: 'notifications', label: 'Notifications', icon: <MdNotifications size={20} /> },
        { id: 'billing', label: 'Billing & Payments', icon: <MdPayment size={20} /> },
    ];

    if (isLoading) {
        return (
            <DashboardLayout userRole={userRole} title="Settings">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center items-center h-64"
                >
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full"
                        />
                        <p className="text-neutral-600 font-medium">Loading settings...</p>
                    </div>
                </motion.div>
            </DashboardLayout>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="flex items-center gap-6 mb-8 p-6 bg-gradient-to-r from-neutral-50 to-primary-50/30 rounded-3xl shadow-soft"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="relative group"
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {profileData.displayName.charAt(0).toUpperCase()}
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="absolute bottom-0 right-0 p-2 bg-gradient-to-br from-white to-neutral-50 rounded-full shadow-lg hover:shadow-xl border border-neutral-200 text-primary-600 transition-shadow"
                                >
                                    <MdEdit size={16} />
                                </motion.button>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <h3 className="text-2xl font-bold text-neutral-900">{profileData.displayName}</h3>
                                <p className="text-neutral-500 font-medium">{userRole === 'owner' ? 'Billboard Owner' : 'Advertiser Account'}</p>
                            </motion.div>
                        </motion.div>

                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            onSubmit={handleProfileUpdate}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                                <Input
                                    disabled={!isEditing}
                                    value={profileData.displayName}
                                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                    type="text"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                                <Input
                                    disabled={true}
                                    value={profileData.email}
                                    type="email"
                                />
                                <p className="text-xs text-neutral-500 mt-1">Contact support to change email</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number</label>
                                <Input
                                    disabled={!isEditing}
                                    placeholder="+234..."
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    type="tel"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Bio / Company Description</label>
                                <textarea
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500 resize-none"
                                    rows={4}
                                    placeholder="Tell us a bit about yourself or your company..."
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                />
                            </div>

                            {isEditing ? (
                                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button type="submit" icon={<MdSave />}>Save Changes</Button>
                                </div>
                            ) : (
                                <div className="md:col-span-2 flex justify-end mt-4">
                                    <Button type="button" onClick={() => setIsEditing(true)} icon={<MdEdit />}>Edit Profile</Button>
                                </div>
                            )}
                        </motion.form>
                    </motion.div>
                );

            case 'security':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                    >
                        <h3 className="text-2xl font-bold text-neutral-900 mb-6">Password & Security</h3>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="p-6 border border-neutral-200 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 mb-6 shadow-soft"
                        >
                            <div className="flex justify-between items-center mb-6 pb-6 border-b border-neutral-200">
                                <div>
                                    <h4 className="font-bold text-neutral-900">Change Password</h4>
                                    <p className="text-sm text-neutral-500 font-medium">Update your account password</p>
                                </div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="outline" size="sm">Update</Button>
                                </motion.div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-neutral-900">Two-Factor Authentication</h4>
                                    <p className="text-sm text-neutral-500 font-medium">Add an extra layer of security</p>
                                </div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="outline" size="sm">Enable</Button>
                                </motion.div>
                            </div>
                        </motion.div>

                        <h3 className="text-lg font-bold text-neutral-900 mb-4">Active Sessions</h3>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="space-y-4"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center justify-between p-6 border border-neutral-200 rounded-2xl bg-gradient-to-r from-green-50/50 via-white to-neutral-50 shadow-soft hover:shadow-card transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-soft"
                                    >
                                        <MdSecurity size={20} />
                                    </motion.div>
                                    <div>
                                        <p className="font-bold text-neutral-900">Windows PC • Chrome</p>
                                        <p className="text-xs text-neutral-500 font-medium">Lagos, Nigeria • Active now</p>
                                    </div>
                                </div>
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full"
                                >
                                    Current
                                </motion.span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                );

            case 'notifications':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                    >
                        <h3 className="text-2xl font-bold text-neutral-900 mb-6">Communication Preferences</h3>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="space-y-4"
                        >
                            {[
                                { key: 'emailAlerts', label: 'Email Notifications', desc: 'Receive important updates via email' },
                                { key: 'smsAlerts', label: 'SMS Notifications', desc: 'Get text messages for urgent alerts' },
                                { key: 'newBookings', label: 'Booking Updates', desc: 'Notify me when booking status changes' },
                                { key: 'securityAlerts', label: 'Security Alerts', desc: 'Notify me about suspicious activity' },
                                { key: 'marketingUpdates', label: 'Marketing & Tips', desc: 'Receive tips to optimize your campaigns' }
                            ].map((item, index) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ backgroundColor: '#f8f7ff' }}
                                    className="flex items-center justify-between p-4 border border-neutral-200 rounded-2xl bg-white shadow-soft hover:shadow-card transition-shadow"
                                >
                                    <div>
                                        <p className="font-bold text-neutral-900">{item.label}</p>
                                        <p className="text-sm text-neutral-500">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={notifications[item.key as keyof typeof notifications]}
                                            onChange={(e) => handlePreferenceUpdate(item.key, e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-600 peer-checked:to-primary-500"></div>
                                    </label>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                );

            case 'billing':
                return (
                    <div className="space-y-6">
                        {userRole === 'owner' ? (
                            <>
                                <h3 className="text-lg font-bold text-neutral-900 mb-4">Payout Settings</h3>
                                <Card className="p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600">
                                                <MdCreditCard size={24} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Bank Account</p>
                                                <p className="text-sm text-neutral-500">GTBank •••• 1234</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Change</Button>
                                    </div>
                                    <p className="text-sm text-neutral-500">Payouts are processed weekly on Mondays.</p>
                                </Card>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-neutral-900 mb-4">Payment Methods</h3>
                                <Card className="p-6 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600">
                                                <MdCreditCard size={24} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Mastercard</p>
                                                <p className="text-sm text-neutral-500">•••• 5678 | Exp 12/26</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">Remove</Button>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-neutral-100">
                                        <Button variant="ghost" size="sm" icon={<MdAdd />}>Add Payment Method</Button>
                                    </div>
                                </Card>
                            </>
                        )}

                        <h3 className="text-lg font-bold text-neutral-900 mb-4">Billing History</h3>
                        <div className="border border-neutral-200 rounded-xl overflow-hidden">
                            <div className="p-4 bg-neutral-50 border-b border-neutral-200 font-medium text-sm text-neutral-500 grid grid-cols-4">
                                <span>Date</span>
                                <span>Description</span>
                                <span>Reference</span>
                                <span className="text-right">Amount</span>
                            </div>
                            {payments.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500 text-sm">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3 text-neutral-400">
                                        <MdHistory size={24} />
                                    </div>
                                    No transaction history available yet.
                                </div>
                            ) : (
                                <div>
                                    {payments.map(payment => (
                                        <div key={payment.id} className="p-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 grid grid-cols-4 text-sm items-center">
                                            <span className="text-neutral-600">{new Date(payment.createdAt).toLocaleDateString()}</span>
                                            <span className="font-medium text-neutral-900">{payment.billboardTitle}</span>
                                            <span className="font-mono text-xs text-neutral-500">{payment.reference}</span>
                                            <span className="text-right font-bold text-neutral-900">
                                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(payment.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <DashboardLayout
            userRole={userRole}
            title="Settings"
            subtitle="Manage your account preferences"
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col lg:flex-row gap-8"
            >
                {/* Sidebar Tabs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="w-full lg:w-64 flex-shrink-0"
                >
                    <Card className="overflow-hidden shadow-card bg-gradient-to-br from-white to-neutral-50/50">
                        <div className="flex flex-col">
                            {tabs.map((tab, index) => (
                                <motion.button
                                    key={tab.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                    whileHover={{ backgroundColor: activeTab === tab.id ? undefined : '#f9f7ff' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all border-l-4 ${activeTab === tab.id
                                        ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-soft'
                                        : 'border-transparent text-neutral-600'
                                        }`}
                                >
                                    <motion.span
                                        animate={{ color: activeTab === tab.id ? '#0066ff' : '#a0aec0' }}
                                        className="transition-colors"
                                    >
                                        {tab.icon}
                                    </motion.span>
                                    {tab.label}
                                </motion.button>
                            ))}
                        </div>
                    </Card>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="mt-6"
                    >
                        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-50/50 border border-amber-200 shadow-soft">
                            <h4 className="font-bold text-amber-800 mb-2 text-sm">Need Help?</h4>
                            <p className="text-xs text-amber-700 mb-3 leading-relaxed">
                                Contact our support team if you have any questions about your account settings.
                            </p>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button size="sm" variant="outline" className="w-full border-amber-300 text-amber-800 hover:bg-amber-100">
                                    Contact Support
                                </Button>
                            </motion.div>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Content Area */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="flex-1"
                >
                    <Card className="p-6 md:p-8 min-h-[500px] shadow-card bg-white">
                        {renderContent()}
                    </Card>
                </motion.div>
            </motion.div>
        </DashboardLayout>
    );
};

export default Settings;
