import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { MdEmail, MdLock, MdPerson, MdPhone } from 'react-icons/md';
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
        defaultValues: {
            role: 'advertiser',
        },
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
            // Redirect based on user role
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
            // Redirect based on user role
            if (selectedRole === 'owner') {
                navigate('/dashboard/owner');
            } else {
                navigate('/dashboard/advertiser');
            }
        } catch (err: any) {
            toast.error(err || 'Failed to sign up with Google');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-bold text-primary-600">Adspot</h1>
                    </Link>
                    <h2 className="mt-6 text-3xl font-bold text-neutral-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        Join Nigeria's premier billboard marketplace
                    </p>
                </div>

                {/* Role Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                        I am a...
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setSelectedRole('advertiser')}
                            className={`p-6 rounded-xl border-2 transition-all duration-200 ${selectedRole === 'advertiser'
                                ? 'border-primary-600 bg-primary-50 shadow-md'
                                : 'border-neutral-300 hover:border-primary-400'
                                }`}
                        >
                            <div className="text-4xl mb-2">📢</div>
                            <h3 className="font-semibold text-lg text-neutral-900">
                                Advertiser
                            </h3>
                            <p className="text-sm text-neutral-600 mt-1">
                                Looking to rent billboard space
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedRole('owner')}
                            className={`p-6 rounded-xl border-2 transition-all duration-200 ${selectedRole === 'owner'
                                ? 'border-primary-600 bg-primary-50 shadow-md'
                                : 'border-neutral-300 hover:border-primary-400'
                                }`}
                        >
                            <div className="text-4xl mb-2">🏢</div>
                            <h3 className="font-semibold text-lg text-neutral-900">
                                Billboard Owner
                            </h3>
                            <p className="text-sm text-neutral-600 mt-1">
                                I own billboard spaces to rent
                            </p>
                        </button>
                    </div>
                </div>

                {/* Google Sign Up */}
                <div className="mb-6">
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
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-neutral-500">
                            Or sign up with email
                        </span>
                    </div>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        type="text"
                        label="Full Name"
                        icon={<MdPerson />}
                        placeholder="John Doe"
                        error={errors.displayName?.message}
                        {...register('displayName', {
                            required: 'Full name is required',
                            minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters',
                            },
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

                    <Input
                        type="password"
                        label="Password"
                        icon={<MdLock />}
                        placeholder="Create a strong password"
                        helperText="At least 6 characters"
                        error={errors.password?.message}
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                            },
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
                            validate: (value) =>
                                value === password || 'Passwords do not match',
                        })}
                    />

                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            id="agreeToTerms"
                            {...register('agreeToTerms', {
                                required: true,
                            })}
                            className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label
                            htmlFor="agreeToTerms"
                            className="ml-2 text-sm text-neutral-600"
                        >
                            I agree to the{' '}
                            <a href="#" className="text-primary-600 hover:text-primary-500">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-primary-600 hover:text-primary-500">
                                Privacy Policy
                            </a>
                        </label>
                    </div>

                    <Button type="submit" fullWidth loading={loading} size="lg">
                        Create Account
                    </Button>

                    <p className="text-center text-sm text-neutral-600">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
