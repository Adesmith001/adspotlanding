import React, { useState } from 'react';
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
import type { PendingGoogleSignup, PublicUserRole, SignupCredentials, UserRole } from '@/types/user.types';

interface SignupForm {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber?: string;
    role: UserRole;
    agreeToTerms: boolean;
}

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

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupForm>({ defaultValues: { role: 'advertiser' } });

    const password = watch('password');

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
            const user = await dispatch(completeGoogleSignupRole(selectedRole)).unwrap();
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

    return (
        <div className="min-h-screen bg-[#fafaf9] flex flex-col">
            {/* Top Nav */}
            <nav className="w-full flex items-center justify-between px-6 sm:px-12 py-5">
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
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-start px-4 pb-16 pt-6">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="w-full max-w-2xl"
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
                            <span className="italic font-light">Create Your</span>{' '}Free
                            <br />
                            <span className="italic font-light">Account</span>
                        </h1>
                        <p className="mt-4 text-neutral-500 text-base">
                            Join Nigeria's Premier Marketplace for Outdoor Advertising
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

                    {/* Two-column form layout */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28 }}
                        className="flex flex-col sm:flex-row items-start gap-0"
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
                        <div className="flex sm:flex-col items-center justify-center gap-3 my-5 sm:my-0 w-full sm:w-auto">
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
            </div>

            {/* Footer */}
            <footer className="w-full flex items-center justify-between px-6 sm:px-12 py-5 border-t border-neutral-100">
                <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <Link to="/privacy-policy" className="hover:text-neutral-700 transition-colors">Privacy Policy</Link>
                    <span>|</span>
                    <Link to="/terms-of-service" className="hover:text-neutral-700 transition-colors">Terms &amp; Conditions</Link>
                </div>
                <p className="text-xs text-neutral-400">Copyrights @adspot.ng {new Date().getFullYear()}</p>
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
