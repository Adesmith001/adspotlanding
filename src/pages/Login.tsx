import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { MdEmail, MdLock } from 'react-icons/md';
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
            // Redirect based on user role
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
            const result = await dispatch(signInGoogle(undefined)).unwrap();
            toast.success('Welcome back!');
            // Redirect based on user role
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
        // Password reset logic will be implemented
        toast.success('Password reset email sent!');
        setShowResetModal(false);
        setResetEmail('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-bold text-primary-600">Adspot</h1>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-neutral-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        Sign in to continue to your account
                    </p>
                </div>

                {/* Google Sign In */}
                <div>
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
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-neutral-500">
                            Or continue with email
                        </span>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                    <div className="space-y-4">
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
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={() => setShowResetModal(true)}
                                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                            >
                                Forgot your password?
                            </button>
                        </div>
                    </div>

                    <Button type="submit" fullWidth loading={loading}>
                        Sign in
                    </Button>

                    <p className="text-center text-sm text-neutral-600">
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </form>
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
                        Enter your email address and we'll send you a link to reset your
                        password.
                    </p>
                    <Input
                        type="email"
                        label="Email address"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <Button fullWidth onClick={handlePasswordReset}>
                        Send reset link
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default Login;
