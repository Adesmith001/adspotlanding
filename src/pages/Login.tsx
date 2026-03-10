import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { MdEmail, MdLock, MdArrowForward } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { signIn, signInGoogle, selectAuthLoading, selectAuthError } from '@/store/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import type { LoginCredentials } from '@/types/user.types';

interface LoginForm {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectAuthError);

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>();

    const onSubmit = async (data: LoginForm) => {
        try {
            const result = await dispatch(signIn(data as LoginCredentials)).unwrap();
            toast.success('Welcome back!');
            if (result.role === 'owner') {
                navigate('/dashboard/owner');
            } else {
                navigate('/dashboard/advertiser');
            }
        } catch (err: any) {
            toast.error(err || 'Failed to sign in');
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await dispatch(signInGoogle()).unwrap();
            toast.success('Welcome back!');
            if (result.role === 'owner') {
                navigate('/dashboard/owner');
            } else {
                navigate('/dashboard/advertiser');
            }
        } catch (err: any) {
            toast.error(err || 'Failed to sign in with Google');
        }
    };

    const handlePasswordReset = async () => {
        if (!resetEmail) {
            toast.error('Please enter your email address');
            return;
        }
        toast.success('Password reset email sent!');
        setShowResetModal(false);
        setResetEmail('');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 relative overflow-hidden"
            >
                {/* Decorative circles */}
                <div className="absolute top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
                <div className="absolute bottom-20 right-10 w-64 h-64 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-white/5 rounded-full" />

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
                            Find the perfect
                            <br />
                            billboard for your
                            <br />
                            next campaign.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="text-lg text-white/70 max-w-md"
                        >
                            Nigeria's premier marketplace connecting advertisers with premium outdoor advertising spaces.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-center gap-4"
                    >
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold"
                                >
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <p className="text-white/70 text-sm">
                            Join <span className="text-white font-semibold">2,000+</span> advertisers
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-md w-full px-4 sm:px-0"
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
                        className="mb-10"
                    >
                        <h2 className="text-3xl font-bold text-neutral-900 mb-2">Welcome back</h2>
                        <p className="text-neutral-500">Sign in to continue to your account</p>
                    </motion.div>

                    {/* Google Sign In */}
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
                                onClick={handleGoogleSignIn}
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

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="space-y-4"
                        >
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
                                type="password"
                                label="Password"
                                icon={<MdLock />}
                                placeholder="Enter your password"
                                error={errors.password?.message}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                            />
                        </motion.div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="rounded-2xl bg-red-50 border border-red-200 p-4"
                                >
                                    <p className="text-sm text-red-700">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-end"
                        >
                            <button
                                type="button"
                                onClick={() => setShowResetModal(true)}
                                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Forgot password?
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                        >
                            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                                <Button type="submit" fullWidth loading={loading} size="lg">
                                    Sign in
                                    <MdArrowForward className="ml-2" />
                                </Button>
                            </motion.div>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-center text-sm text-neutral-500 pt-4"
                        >
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Sign up for free
                            </Link>
                        </motion.p>
                    </form>
                </motion.div>
            </div>

            {/* Password Reset Modal */}
            <Modal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                title="Reset Password"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-neutral-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <Input
                        type="email"
                        label="Email address"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                        <Button fullWidth onClick={handlePasswordReset}>
                            Send reset link
                        </Button>
                    </motion.div>
                </div>
            </Modal>
        </div>
    );
};

export default Login;
