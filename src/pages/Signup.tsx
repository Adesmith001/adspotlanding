import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { MdEmail, MdLock, MdPerson, MdPhone, MdArrowForward, MdCheck } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { signUp, signInGoogle, selectAuthLoading } from '@/store/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { SignupCredentials, UserRole } from '@/types/user.types';

interface SignupForm {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber?: string;
    role: UserRole;
    agreeToTerms: boolean;
}

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectAuthLoading);
    const [selectedRole, setSelectedRole] = useState<UserRole>('advertiser');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupForm>({
        defaultValues: { role: 'advertiser' },
    });

    const password = watch('password');

    const onSubmit = async (data: SignupForm) => {
        if (!data.agreeToTerms) {
            toast.error('Please accept the terms and conditions');
            return;
        }
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
            if (selectedRole === 'owner') {
                navigate('/dashboard/owner');
            } else {
                navigate('/dashboard/advertiser');
            }
        } catch (err: any) {
            toast.error(err || 'Failed to create account');
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            await dispatch(signInGoogle(selectedRole)).unwrap();
            toast.success('Account created successfully!');
            if (selectedRole === 'owner') {
                navigate('/dashboard/owner');
            } else {
                navigate('/dashboard/advertiser');
            }
        } catch (err: any) {
            toast.error(err || 'Failed to sign up with Google');
        }
    };

    const roles = [
        {
            key: 'advertiser' as UserRole,
            emoji: '📢',
            title: 'Advertiser',
            description: 'Looking to rent billboard space for campaigns',
        },
        {
            key: 'owner' as UserRole,
            emoji: '🏢',
            title: 'Billboard Owner',
            description: 'I own billboard spaces to rent out',
        },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-accent-600 via-primary-700 to-primary-800 relative overflow-hidden"
            >
                {/* Decorative shapes */}
                <div className="absolute top-10 -right-16 w-72 h-72 bg-white/5 rounded-full" />
                <div className="absolute bottom-32 -left-10 w-56 h-56 bg-white/5 rounded-full" />
                <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <Link to="/">
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-bold text-white"
                        >
                            Adspot
                        </motion.h1>
                    </Link>

                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-4xl font-bold text-white leading-tight mb-4"
                        >
                            Start your
                            <br />
                            advertising journey
                            <br />
                            today.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-lg text-white/70 max-w-md"
                        >
                            Create an account to access premium billboard spaces across Nigeria's busiest locations.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-4"
                    >
                        {[
                            'Access to 5,000+ billboard locations',
                            'Secure payments with Korapay',
                            'Real-time campaign tracking',
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <MdCheck size={14} className="text-white" />
                                </div>
                                <span className="text-white/80 text-sm">{feature}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Panel - Signup Form */}
            <div className="w-full lg:w-7/12 flex items-start justify-center p-4 sm:p-8 py-12 bg-white overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-lg w-full px-4 sm:px-0"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/">
                            <h1 className="text-3xl font-bold text-primary-600">Adspot</h1>
                        </Link>
                    </div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <h2 className="text-3xl font-bold text-neutral-900 mb-2">Create your account</h2>
                        <p className="text-neutral-500">Join Nigeria's premier billboard marketplace</p>
                    </motion.div>

                    {/* Role Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="mb-8"
                    >
                        <label className="block text-sm font-semibold text-neutral-700 mb-3">
                            I am a...
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {roles.map((role) => (
                                <motion.button
                                    key={role.key}
                                    type="button"
                                    onClick={() => setSelectedRole(role.key)}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`relative p-6 rounded-2xl border-2 transition-all duration-200 text-left ${selectedRole === role.key
                                        ? 'border-primary-600 bg-primary-50 shadow-soft'
                                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                                        }`}
                                >
                                    {selectedRole === role.key && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-3 right-3 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                                        >
                                            <MdCheck size={14} className="text-white" />
                                        </motion.div>
                                    )}
                                    <div className="text-3xl mb-3">{role.emoji}</div>
                                    <h3 className="font-semibold text-neutral-900 mb-1">{role.title}</h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed">{role.description}</p>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Google Sign Up */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-6"
                    >
                        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                type="button"
                                variant="outline"
                                fullWidth
                                onClick={handleGoogleSignUp}
                                icon={<FcGoogle className="text-xl" />}
                                disabled={loading}
                            >
                                Continue with Google
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-neutral-400 text-xs font-medium uppercase tracking-wider">
                                or
                            </span>
                        </div>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="space-y-4"
                        >
                            <Input
                                type="text"
                                label="Full Name"
                                icon={<MdPerson />}
                                placeholder="John Doe"
                                error={errors.displayName?.message}
                                {...register('displayName', {
                                    required: 'Full name is required',
                                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                })}
                            />
                            <Input
                                type="email"
                                label="Email address"
                                icon={<MdEmail />}
                                placeholder="you@example.com"
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
                                label="Phone Number (Optional)"
                                icon={<MdPhone />}
                                placeholder="0801 234 5678"
                                helperText="Nigerian phone number"
                                error={errors.phoneNumber?.message}
                                {...register('phoneNumber', {
                                    pattern: {
                                        value: /^(\+?234|0)[789]\d{9}$/,
                                        message: 'Invalid Nigerian phone number',
                                    },
                                })}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-4"
                        >
                            <Input
                                type="password"
                                label="Password"
                                icon={<MdLock />}
                                placeholder="Create a strong password"
                                helperText="At least 6 characters"
                                error={errors.password?.message}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                })}
                            />
                            <Input
                                type="password"
                                label="Confirm Password"
                                icon={<MdLock />}
                                placeholder="Re-enter your password"
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) => value === password || 'Passwords do not match',
                                })}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.55 }}
                            className="flex items-start pt-2"
                        >
                            <input
                                type="checkbox"
                                id="agreeToTerms"
                                {...register('agreeToTerms', { required: true })}
                                className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="agreeToTerms" className="ml-3 text-sm text-neutral-600 leading-relaxed">
                                I agree to the{' '}
                                <Link to="/terms-of-service" className="text-primary-600 hover:text-primary-700 font-medium">Terms of Service</Link>{' '}
                                and{' '}
                                <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-700 font-medium">Privacy Policy</Link>
                            </label>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="pt-2"
                        >
                            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                                <Button type="submit" fullWidth loading={loading} size="lg">
                                    Create Account
                                    <MdArrowForward className="ml-2" />
                                </Button>
                            </motion.div>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.65 }}
                            className="text-center text-sm text-neutral-500 pt-4"
                        >
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Sign in
                            </Link>
                        </motion.p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
