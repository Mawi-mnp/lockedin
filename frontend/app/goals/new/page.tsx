'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { api, CreateGoalRequest } from '@/lib/api';
import { FadeIn, FadeInUp } from '@/components/animations';
import Mascot from '@/components/Mascot';

const CATEGORIES = [
  { id: 'business', name: 'Business', icon: '💼', description: 'Launch a product, hit revenue goals' },
  { id: 'fitness', name: 'Fitness', icon: '💪', description: 'Marathon training, weight loss goals' },
  { id: 'education', name: 'Education', icon: '📚', description: 'Complete a course, learn a skill' },
  { id: 'creative', name: 'Creative', icon: '🎨', description: 'Write a book, create art' },
  { id: 'personal', name: 'Personal', icon: '🌱', description: 'Build habits, personal growth' },
  { id: 'financial', name: 'Financial', icon: '💰', description: 'Save money, pay off debt' },
];

interface GoalForm {
  title: string;
  description: string;
  target_amount: number;
  deadline: string;
  category: string;
}

export default function NewGoalPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GoalForm>();

  const onSubmit = async (data: GoalForm) => {
    setCreating(true);
    setError(null);
    try {
      await api.createGoal({
        title: data.title,
        description: `[${data.category}] ${data.description}`,
        target_amount: data.target_amount,
        deadline: data.deadline,
      } as CreateGoalRequest);
      router.push('/goals');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated gradient orb */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(83,58,253,0.1)_0%,rgba(168,85,247,0.05)_40%,transparent_70%)] blur-[60px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
              <div className="w-8 h-8 bg-gradient-to-br from-[#533afd] to-[#a855f7] rounded-lg flex items-center justify-center">
                🦡
              </div>
              <span>LockedIn</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-[#a6a6a6] hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/goals" className="text-sm text-[#a6a6a6] hover:text-white transition-colors">
                Goals
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <FadeInUp className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Create Your <span className="bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent">Goal</span>
            </h1>
            <p className="text-xl text-[#a6a6a6]">
              Lock in your commitment. Set your stake. Achieve greatness.
            </p>
          </motion.div>
        </FadeInUp>

        {/* Mascot */}
        <div className="flex justify-center mb-8">
          <Mascot expression="working" size="lg" />
        </div>

        {/* Form */}
        <FadeIn>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-8 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-[#a6a6a6] mb-3 uppercase tracking-widest">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-4 rounded-xl border text-left transition-all duration-300 hover:-translate-y-0.5 ${
                      selectedCategory === cat.id
                        ? 'border-[#533afd] bg-[#533afd]/10 shadow-lg shadow-[#533afd]/20'
                        : 'border-white/8 hover:border-[#533afd]/50 hover:bg-white/5'
                    }`}
                  >
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <div className="font-medium text-sm">{cat.name}</div>
                    <div className="text-xs text-[#666] mt-1">{cat.description}</div>
                  </motion.button>
                ))}
              </div>
              <input type="hidden" {...register('category', { required: 'Please select a category' })} value={selectedCategory} />
              {errors.category && (
                <p className="mt-2 text-sm text-red-400">{errors.category.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#a6a6a6] mb-2">
                Goal Title
              </label>
              <input
                id="title"
                type="text"
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters',
                  },
                })}
                className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd] transition-colors"
                placeholder="e.g., Complete Marathon Training"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#a6a6a6] mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 10,
                    message: 'Description must be at least 10 characters',
                  },
                })}
                className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd] transition-colors resize-none"
                placeholder="Describe your goal and what success looks like..."
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Target Amount & Deadline Row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Target Amount */}
              <div>
                <label htmlFor="target_amount" className="block text-sm font-medium text-[#a6a6a6] mb-2">
                  Target Amount ($)
                </label>
                <input
                  id="target_amount"
                  type="number"
                  min="1"
                  {...register('target_amount', {
                    required: 'Target amount is required',
                    min: {
                      value: 1,
                      message: 'Amount must be at least $1',
                    },
                  })}
                  className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd] transition-colors"
                  placeholder="100"
                />
                {errors.target_amount && (
                  <p className="mt-2 text-sm text-red-400">{errors.target_amount.message}</p>
                )}
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-[#a6a6a6] mb-2">
                  Deadline
                </label>
                <input
                  id="deadline"
                  type="date"
                  {...register('deadline', {
                    required: 'Deadline is required',
                    validate: (value) =>
                      new Date(value) > new Date() || 'Deadline must be in the future',
                  })}
                  className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd] transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                />
                {errors.deadline && (
                  <p className="mt-2 text-sm text-red-400">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-[#533afd]/10 border border-[#533afd]/20 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <h4 className="font-medium text-sm mb-1">How it works</h4>
                  <p className="text-xs text-[#a6a6a6]">
                    Set your target amount as your commitment stake. If you fail to meet your goal by the deadline, 
                    you lose the amount. Succeed and you keep it all. Your Commitment Score increases with every goal completed.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Link
                href="/goals"
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/8 text-white text-center py-3 px-4 rounded-xl font-medium transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={creating || !selectedCategory}
                className="flex-1 bg-gradient-to-r from-[#533afd] to-[#665efd] hover:shadow-lg hover:shadow-[#533afd]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none text-white py-3 px-4 rounded-xl font-medium transition-all hover:-translate-y-0.5"
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Goal'
                )}
              </button>
            </div>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
