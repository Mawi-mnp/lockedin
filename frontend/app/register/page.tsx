'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#533afd] focus:text-white focus:rounded-md focus:shadow-lg">
        Skip to main content
      </a>

      {/* Animated gradient orb background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(83,58,253,0.15)_0%,rgba(168,85,247,0.08)_40%,transparent_70%)] blur-[60px] animate-pulse" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Mascot */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-[#533afd] to-[#a855f7] rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-[#533afd]/30" aria-hidden="true">
            🦡
          </div>
        </div>

        <h2 className="text-center text-3xl font-bold tracking-tight" id="main-content">
          Start building your reputation
        </h2>
        <p className="mt-2 text-center text-sm text-[#a6a6a6]">
          Join entrepreneurs who prove their commitment every day
        </p>
      </div>

      <div className="mt-8 relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0a0a0a] border border-white/8 py-8 px-4 rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#a6a6a6]">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                    maxLength: {
                      value: 30,
                      message: 'Username must be less than 30 characters',
                    },
                  })}
                  className="appearance-none block w-full px-4 py-3 bg-[#0f0f0f] border border-white/8 rounded-xl text-white placeholder-[#666] focus:outline-none focus:border-[#533afd] focus:ring-2 focus:ring-[#533afd]/20 transition-all sm:text-sm"
                  placeholder="johndoe"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-400">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#a6a6a6]">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="appearance-none block w-full px-4 py-3 bg-[#0f0f0f] border border-white/8 rounded-xl text-white placeholder-[#666] focus:outline-none focus:border-[#533afd] focus:ring-2 focus:ring-[#533afd]/20 transition-all sm:text-sm"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#a6a6a6]">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="appearance-none block w-full px-4 py-3 bg-[#0f0f0f] border border-white/8 rounded-xl text-white placeholder-[#666] focus:outline-none focus:border-[#533afd] focus:ring-2 focus:ring-[#533afd]/20 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#a6a6a6]">
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  className="appearance-none block w-full px-4 py-3 bg-[#0f0f0f] border border-white/8 rounded-xl text-white placeholder-[#666] focus:outline-none focus:border-[#533afd] focus:ring-2 focus:ring-[#533afd]/20 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                {...register('terms', {
                  required: 'You must accept the terms',
                })}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0f0f0f] text-[#533afd] focus:ring-[#533afd] focus:ring-offset-0"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-[#a6a6a6] leading-relaxed">
                I agree to the{' '}
                <a href="#" className="font-medium text-[#533afd] hover:text-[#a855f7] transition-colors">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-[#533afd] hover:text-[#a855f7] transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-400">{errors.terms.message}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#533afd] to-[#665efd] hover:shadow-lg hover:shadow-[#533afd]/30 focus:outline-none focus:ring-2 focus:ring-[#533afd] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-[#a6a6a6]">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#533afd] hover:text-[#a855f7] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
