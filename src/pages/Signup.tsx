import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { MdEmail, MdLock, MdPerson, MdPhone, MdArrowForward, MdCheck, MdArrowRightAlt } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { beginGoogleSignupFlow, completeGoogleSignupRole, signUp, selectAuthLoading } from '@/store/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { cancelPendingGoogleSignUp } from '@/services/auth.service';
import { applyCouponDiscount, getActiveCouponByCode, type OwnerCoupon } from '@/services/coupon.service';
import { DEFAULT_OWNER_PRICING_PLAN } from '@/services/user.service';
import type { PendingGoogleSignup, PublicUserRole, SignupCredentials, UserRole, OwnerPricingPlanMode } from '@/types/user.types';
import type { ListingCategory } from '@/types/billboard.types';

interface SignupForm {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber?: string;
    role: UserRole;
    agreeToTerms: boolean;
}

const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(value);

const roles = [
    {
        key: 'advertiser' as PublicUserRole,
        emoji: '📢',
        title: 'Advertiser',
        description: 'Looking to rent billboard space for campaigns',
    },
    {
        key: 'owner' as PublicUserRole,
        emoji: '🏢',
        title: 'Billboard Owner',
        description: 'I own billboard spaces to rent out',
    },
];

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectAuthLoading);
    const [selectedRole, setSelectedRole] = useState<PublicUserRole>('advertiser');
    const [pendingGoogleProfile, setPendingGoogleProfile] = useState<PendingGoogleSignup | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [primaryAssetType, setPrimaryAssetType] = useState<ListingCategory>('billboard');
    const [ownerPlanMode, setOwnerPlanMode] = useState<OwnerPricingPlanMode>('fixed_monthly');
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<OwnerCoupon | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupForm>({ defaultValues: { role: 'advertiser' } });

    const password = watch('password');

    const discountedPlan = useMemo(
        () =>
            applyCouponDiscount({
                mode: ownerPlanMode,
                monthlyFee: DEFAULT_OWNER_PRICING_PLAN.fixedMonthlyFee,
                yearlyFee: DEFAULT_OWNER_PRICING_PLAN.fixedYearlyFee,
                revenueSharePercent: DEFAULT_OWNER_PRICING_PLAN.revenueSharePercent,
                coupon: appliedCoupon,
            }),
        [ownerPlanMode, appliedCoupon],
    );

    const buildOwnerPlanPayload = () => ({
        mode: ownerPlanMode,
        fixedMonthlyFee: DEFAULT_OWNER_PRICING_PLAN.fixedMonthlyFee,
        fixedYearlyFee: DEFAULT_OWNER_PRICING_PLAN.fixedYearlyFee,
        revenueSharePercent: DEFAULT_OWNER_PRICING_PLAN.revenueSharePercent,
        effectiveMonthlyFee: discountedPlan.effectiveMonthlyFee,
        effectiveYearlyFee: discountedPlan.effectiveYearlyFee,
        effectiveRevenueSharePercent: discountedPlan.effectiveRevenueSharePercent,
        coupon: discountedPlan.coupon,
        paymentStatus: 'active' as const,
    });

    const navigateToRoleDashboard = (role: UserRole) => {
        if (role === 'owner') { navigate('/dashboard/owner'); return; }
        navigate('/dashboard/advertiser');
    };

    const onSubmit = async (data: SignupForm) => {
        if (!data.agreeToTerms) { toast.error('Please accept the terms and conditions'); return; }
        try {
            const credentials: SignupCredentials = {
                email: data.email,
                password: data.password,
                displayName: data.displayName,
                role: selectedRole,
                phoneNumber: data.phoneNumber,
                primaryAssetType: selectedRole === 'owner' ? primaryAssetType : undefined,
                ownerPricingPlan: selectedRole === 'owner' ? buildOwnerPlanPayload() : undefined,
            };
            await dispatch(signUp(credentials)).unwrap();
            toast.success('Account created successfully!');
            navigateToRoleDashboard(selectedRole);
        } catch (err: any) {
            toast.error(err || 'Failed to create account');
        }
    };

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        try {
            const result = await dispatch(beginGoogleSignupFlow()).unwrap();
            if (result.requiresRoleSelection) { setPendingGoogleProfile(result.profile); return; }
            toast.success('Welcome back!');
            navigateToRoleDashboard(result.user.role);
        } catch (err: any) {
            toast.error(err || 'Failed to sign up with Google');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleCompleteGoogleSignup = async () => {
        try {
            const user = await dispatch(
                completeGoogleSignupRole(
                    selectedRole === 'owner'
                        ? {
                            role: selectedRole,
                            primaryAssetType,
                            ownerPricingPlan: buildOwnerPlanPayload(),
                        }
                        : selectedRole,
                ),
            ).unwrap();
            setPendingGoogleProfile(null);
            toast.success('Account created successfully!');
            navigateToRoleDashboard(user.role);
        } catch (err: any) {
            toast.error(err || 'Failed to finish Google signup');
        }
    };

    const handleCloseGoogleRoleModal = async () => {
        setPendingGoogleProfile(null);
        try { await cancelPendingGoogleSignUp(); } catch { /* best-effort */ }
    };

    const handleApplyCoupon = async () => {
        const normalizedCode = couponCode.trim().toUpperCase();
        if (!normalizedCode) {
            toast.error('Enter a coupon code first');
            return;
        }

        setCouponLoading(true);
        try {
            const coupon = await getActiveCouponByCode(normalizedCode);
            if (!coupon) {
                setAppliedCoupon(null);
                toast.error('Coupon not found or inactive');
                return;
            }

            setAppliedCoupon(coupon);
            setCouponCode(coupon.code);
            toast.success(`${coupon.percentOff}% discount applied`);
        } catch (error) {
            console.error('Error applying coupon:', error);
            toast.error('Could not validate coupon right now');
        } finally {
            setCouponLoading(false);
        }
    };

    const renderOwnerOnboarding = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mb-10 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Owner onboarding</p>
                    <h2 className="mt-2 max-w-2xl text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl">Choose your access plan before entering the app</h2>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-500">
                        Owners get access immediately after selecting a plan during signup.
                    </p>
                </div>
                <span className="rounded-full bg-[#d4f34a]/40 px-4 py-2 text-sm font-semibold text-green-900">
                    Access unlocked on signup
                </span>
            </div>

            <div className="mt-8">
                <p className="mb-3 text-sm font-semibold text-neutral-900">What do you primarily rent out?</p>
                <div className="grid gap-3 md:grid-cols-2">
                    {([
                        { value: 'billboard', label: 'Billboards' },
                        { value: 'screen', label: 'Screens' },
                    ] as const).map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setPrimaryAssetType(item.value)}
                            className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                                primaryAssetType === item.value
                                    ? 'border-neutral-900 bg-neutral-900 text-white'
                                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300'
                            }`}
                        >
                            <p className="font-semibold">{item.label}</p>
                            <p className={`mt-1 text-xs ${primaryAssetType === item.value ? 'text-white/70' : 'text-neutral-500'}`}>
                                This becomes your default owner inventory focus.
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <p className="mb-3 text-sm font-semibold text-neutral-900">Choose how you want to pay AdSpot</p>
                <div className="grid gap-3 md:grid-cols-3">
                    {([
                        {
                            value: 'fixed_monthly',
                            title: 'Monthly',
                            price: formatPrice(discountedPlan.effectiveMonthlyFee),
                            sub: `${formatPrice(DEFAULT_OWNER_PRICING_PLAN.fixedMonthlyFee)}/month base`,
                        },
                        {
                            value: 'fixed_yearly',
                            title: 'Yearly',
                            price: formatPrice(discountedPlan.effectiveYearlyFee),
                            sub: `${formatPrice(DEFAULT_OWNER_PRICING_PLAN.fixedYearlyFee)}/year base`,
                        },
                        {
                            value: 'revenue_share',
                            title: 'Revenue share',
                            price: `${discountedPlan.effectiveRevenueSharePercent}%`,
                            sub: `of weekly earnings from the 15% base`,
                        },
                    ] as const).map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setOwnerPlanMode(item.value)}
                            className={`rounded-2xl border p-4 text-left transition-colors ${
                                ownerPlanMode === item.value
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }`}
                        >
                            <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                            <p className="mt-2 text-2xl font-bold text-neutral-900">{item.price}</p>
                            <p className="mt-1 text-xs text-neutral-500">{item.sub}</p>
                            {appliedCoupon && (
                                <p className="mt-2 text-xs font-medium text-green-700">
                                    Coupon {appliedCoupon.code} applied: {appliedCoupon.percentOff}% off
                                </p>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <div className="flex-1">
                        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Coupon code</label>
                        <Input
                            type="text"
                            placeholder="Enter owner coupon"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" onClick={handleApplyCoupon} disabled={couponLoading}>
                            {couponLoading ? 'Applying...' : 'Apply Coupon'}
                        </Button>
                        {appliedCoupon && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setAppliedCoupon(null);
                                    setCouponCode('');
                                }}
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                    Coupons reduce the selected owner plan by percentage. Fixed plans reduce the naira total, and revenue share reduces the weekly percentage.
                </p>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#fafaf9]">
            {/* Top Nav */}
            <nav className="w-full border-b border-neutral-100 bg-[#fafaf9]/95 px-6 py-5 backdrop-blur sm:px-12">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
                <Link to="/" className="flex items-center gap-1">
                    <span className="text-xl font-bold tracking-tight text-neutral-900">adspot</span>
                    <span className="text-xl font-bold text-neutral-900">.</span>
                </Link>
                <div className="flex items-center gap-5">
                    <span className="hidden sm:block text-sm text-neutral-400">support@adspot.ng</span>
                    <div className="w-px h-4 bg-neutral-200 hidden sm:block" />
                    <Link to="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                        Sign In
                    </Link>
                    <Link
                        to="/listings"
                        className="text-sm font-semibold px-4 py-2 rounded-full bg-[#d4f34a] text-neutral-900 hover:bg-[#c8e840] transition-colors"
                    >
                        Browse Billboards
                    </Link>
                </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:pb-28">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className={`mx-auto w-full ${selectedRole === 'owner' ? 'max-w-5xl' : 'max-w-2xl'}`}
                >
                    {/* Eyebrow badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex justify-center mb-6"
                    >
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-200 bg-white text-sm text-neutral-600 hover:border-neutral-300 transition-colors shadow-sm"
                        >
                            Already have an account?{' '}
                            <span className="font-medium text-neutral-900">Sign in here</span>
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900 text-white">
                                <MdArrowRightAlt size={14} />
                            </span>
                        </Link>
                    </motion.div>

                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-5xl sm:text-6xl font-bold leading-tight text-neutral-900 tracking-tight">
                            <span className="italic font-light">Create Your</span>{' '}
                            {selectedRole === 'owner' ? 'Owner' : 'Free'}
                            <br />
                            <span className="italic font-light">Account</span>
                        </h1>
                        <p className="mt-4 text-neutral-500 text-base">
                            {selectedRole === 'owner'
                                ? 'Choose your owner access plan, apply any coupon, and enter the app immediately.'
                                : "Join Nigeria's Premier Marketplace for Outdoor Advertising"}
                        </p>
                    </motion.div>

                    {/* Role selector */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-7"
                    >
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest text-center mb-3">I am a...</p>
                        <div className="grid grid-cols-2 gap-3">
                            {roles.map((role) => (
                                <motion.button
                                    key={role.key}
                                    type="button"
                                    onClick={() => setSelectedRole(role.key)}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${selectedRole === role.key
                                        ? 'border-neutral-900 bg-neutral-900 shadow-md'
                                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                                        }`}
                                >
                                    {selectedRole === role.key && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-3 right-3 w-5 h-5 bg-[#d4f34a] rounded-full flex items-center justify-center"
                                        >
                                            <MdCheck size={12} className="text-neutral-900" />
                                        </motion.div>
                                    )}
                                    <div className="text-2xl mb-2">{role.emoji}</div>
                                    <h3 className={`font-semibold text-sm mb-0.5 ${selectedRole === role.key ? 'text-white' : 'text-neutral-900'}`}>
                                        {role.title}
                                    </h3>
                                    <p className={`text-xs leading-relaxed ${selectedRole === role.key ? 'text-white/70' : 'text-neutral-500'}`}>
                                        {role.description}
                                    </p>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {selectedRole === 'owner' && renderOwnerOnboarding()}

                    {/* Two-column form layout */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28 }}
                        className="rounded-[2rem] border border-neutral-200 bg-white px-5 py-6 shadow-sm sm:flex sm:items-start sm:px-7 sm:py-8"
                    >
                        {/* Left col — email form */}
                        <div className="w-full sm:flex-1 sm:pr-8">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                                <Input
                                    type="text"
                                    placeholder="Full Name"
                                    icon={<MdPerson />}
                                    error={errors.displayName?.message}
                                    {...register('displayName', {
                                        required: 'Full name is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                    })}
                                />
                                <Input
                                    type="email"
                                    placeholder="Email Address"
                                    icon={<MdEmail />}
                                    error={errors.email?.message}
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                />
                                <Input
                                    type="tel"
                                    placeholder="Phone Number (Optional)"
                                    icon={<MdPhone />}
                                    error={errors.phoneNumber?.message}
                                    {...register('phoneNumber', {
                                        pattern: {
                                            value: /^(\+?234|0)[789]\d{9}$/,
                                            message: 'Invalid Nigerian phone number',
                                        },
                                    })}
                                />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    icon={<MdLock />}
                                    error={errors.password?.message}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                    })}
                                />
                                <Input
                                    type="password"
                                    placeholder="Confirm Password"
                                    icon={<MdLock />}
                                    error={errors.confirmPassword?.message}
                                    {...register('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: (value) => value === password || 'Passwords do not match',
                                    })}
                                />

                                <label className="flex items-start gap-3 pt-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="agreeToTerms"
                                        {...register('agreeToTerms', { required: true })}
                                        className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 flex-shrink-0"
                                    />
                                    <span className="text-xs text-neutral-500 leading-relaxed">
                                        I agree to the{' '}
                                        <Link to="/terms-of-service" className="text-neutral-900 underline hover:no-underline font-medium">Terms of Service</Link>
                                        {' '}and{' '}
                                        <Link to="/privacy-policy" className="text-neutral-900 underline hover:no-underline font-medium">Privacy Policy</Link>
                                    </span>
                                </label>

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-full bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 disabled:opacity-60 transition-colors"
                                >
                                    <span>{loading ? 'Creating account...' : 'Create Your Account'}</span>
                                    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <MdArrowForward size={15} />
                                    </span>
                                </motion.button>
                            </form>
                        </div>

                        {/* Divider */}
                        <div className="my-6 flex w-full items-center justify-center gap-3 sm:my-0 sm:w-auto sm:flex-col">
                            <div className="flex-1 sm:flex-none sm:h-32 w-full sm:w-px bg-neutral-200" />
                            <span className="text-sm text-neutral-400 font-medium">/</span>
                            <div className="flex-1 sm:flex-none sm:h-32 w-full sm:w-px bg-neutral-200" />
                        </div>

                        {/* Right col — Google */}
                        <div className="w-full sm:flex-1 sm:pl-8 space-y-3">
                            <motion.button
                                type="button"
                                onClick={handleGoogleSignUp}
                                disabled={googleLoading || loading}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm disabled:opacity-60 transition-all text-sm font-medium text-neutral-700"
                            >
                                <FcGoogle size={20} className="flex-shrink-0" />
                                <span>{googleLoading ? 'Connecting...' : 'Sign up with Google Account'}</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-neutral-100 px-6 py-5 sm:px-12">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <Link to="/privacy-policy" className="hover:text-neutral-700 transition-colors">Privacy Policy</Link>
                    <span>|</span>
                    <Link to="/terms-of-service" className="hover:text-neutral-700 transition-colors">Terms &amp; Conditions</Link>
                </div>
                <p className="text-xs text-neutral-400">Copyrights @adspot.ng {new Date().getFullYear()}</p>
                </div>
            </footer>

            {/* Google Role Selection Modal */}
            <Modal
                isOpen={!!pendingGoogleProfile}
                onClose={handleCloseGoogleRoleModal}
                title="One last step — pick your role"
                size="md"
            >
                <div className="space-y-5 p-2">
                    <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4">
                        <p className="text-sm font-semibold text-neutral-900">Continuing as</p>
                        <p className="text-sm text-neutral-600 mt-1">
                            {pendingGoogleProfile?.displayName || pendingGoogleProfile?.email || 'Google user'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {roles.map((role) => (
                            <button
                                key={role.key}
                                type="button"
                                onClick={() => setSelectedRole(role.key)}
                                className={`rounded-2xl border-2 p-4 text-left transition-all ${selectedRole === role.key
                                    ? 'border-neutral-900 bg-neutral-900'
                                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                                    }`}
                            >
                                <div className="text-2xl mb-2">{role.emoji}</div>
                                <p className={`font-semibold text-sm ${selectedRole === role.key ? 'text-white' : 'text-neutral-900'}`}>
                                    {role.title}
                                </p>
                                <p className={`text-xs mt-1 leading-relaxed ${selectedRole === role.key ? 'text-white/70' : 'text-neutral-500'}`}>
                                    {role.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    {selectedRole === 'owner' && (
                        <div className="pt-1">
                            {renderOwnerOnboarding()}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <Button type="button" variant="outline" fullWidth onClick={handleCloseGoogleRoleModal}>
                            Cancel
                        </Button>
                        <Button type="button" fullWidth loading={loading} onClick={handleCompleteGoogleSignup}>
                            Finish Signup
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Signup;
