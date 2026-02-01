'use client';

import { useState, FormEvent } from 'react';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/endpoints';
import Link from 'next/link';

export default function AdminForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await apiClient.post(endpoints.admin.forgotPassword, {
                email: email,
            });

            if (response.statusCode === 200 || response.statusCode === 201) {
                setSuccess(true);
            } else {
                setError(response.message || 'Failed to send reset email. Please try again.');
            }
        } catch (err: any) {
            console.error('Forgot password error:', err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Image/Branding */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12" style={{ backgroundColor: 'rgb(22, 25, 80)' }}>
                <div className="max-w-md text-white">
                    <h1 className="text-4xl font-bold mb-4">PerkX Admin Portal</h1>
                    <p className="text-lg text-blue-100 mb-8">
                        Reset your password to regain access to your admin account.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">Secure Process</h3>
                                <p className="text-sm text-blue-100">Your data is protected</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">Email Verification</h3>
                                <p className="text-sm text-blue-100">Check your inbox for reset link</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Forgot Password Form */}
            <div className="flex flex-col flex-1 lg:w-1/2 w-full bg-white dark:bg-gray-900">
                <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-4">
                    <Link
                        href="/admin/login"
                        className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to login
                    </Link>
                </div>

                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 pb-10">
                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="mb-2 font-semibold text-gray-800 text-3xl dark:text-white/90 sm:text-4xl">
                                Forgot Password?
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {success
                                    ? "Check your email for reset instructions"
                                    : "Enter your email address and we'll send you a link to reset your password"
                                }
                            </p>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                            Reset email sent successfully!
                                        </p>
                                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                            Please check your email inbox and follow the instructions to reset your password.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {!success && (
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-6">
                                    {/* Email Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@example.com"
                                            required
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading || !email.trim()}
                                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                                    >
                                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                                    </button>

                                    {/* Back to Login Link */}
                                    <div className="text-center">
                                        <Link
                                            href="/admin/login"
                                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            Remember your password? Sign in
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        )}

                        {success && (
                            <div className="space-y-4">
                                <Link
                                    href="/admin/login"
                                    className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                                >
                                    Back to Login
                                </Link>
                                <button
                                    onClick={() => {
                                        setSuccess(false);
                                        setEmail('');
                                    }}
                                    className="block w-full py-3 px-4 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 text-center"
                                >
                                    Send Another Email
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="w-full max-w-md mx-auto px-4 pb-6">
                    <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                        Powered by PerkX Admin Dashboard
                    </p>
                </div>
            </div>
        </div>
    );
}
