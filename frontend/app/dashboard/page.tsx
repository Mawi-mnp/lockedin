'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CommitmentScore from '@/components/CommitmentScore';
import GoalCard from '@/components/GoalCard';
import TransactionHistory from '@/components/TransactionHistory';
import Mascot from '@/components/Mascot';
import { api, User, Goal, Transaction } from '@/lib/api';
import { FadeIn, FadeInUp, StaggerItem } from '@/components/animations';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await api.getDashboardData();
        setUser(data.user);
        setGoals(data.goals);
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        api.logout();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#533afd]/30 border-t-[#533afd] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a6a6a6] text-sm">Loading your commitment data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completionRate = goals.length > 0 
    ? Math.round((goals.filter((g) => g.status === 'completed').length / goals.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-black text-white">
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
              <Link href="/pricing" className="text-sm text-[#a6a6a6] hover:text-white transition-colors">
                Upgrade
              </Link>
              <div className="text-sm text-[#a6a6a6]">
                {user.username}
              </div>
              <button 
                onClick={() => { api.logout(); router.push('/'); }}
                className="text-sm text-[#a6a6a6] hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-[#a6a6a6] mt-1">Welcome back, <span className="text-white font-medium">{user.username}</span></p>
          </div>
          <Mascot 
            expression={(user.commitment_score ?? 0) >= 70 ? 'celebrating' : (user.commitment_score ?? 0) >= 50 ? 'working' : 'nudge'} 
            size="lg" 
          />
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Commitment Score Card */}
          <FadeInUp>
            <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-medium text-[#a6a6a6] mb-4 text-center uppercase tracking-widest">
                Commitment Score
              </h2>
              <CommitmentScore score={user.commitment_score ?? 0} size="lg" />
              <div className="mt-4 text-center">
                <p className="text-xs text-[#666]">
                  {(user.commitment_score ?? 0) >= 80
                    ? '🏆 Champion level — Top performer'
                    : (user.commitment_score ?? 0) >= 60
                    ? '🎯 Achiever — Solid track record'
                    : (user.commitment_score ?? 0) >= 40
                    ? '📈 Builder — Growing reputation'
                    : '🌱 Starter — Time to prove commitment'}
                </p>
              </div>
            </div>
          </FadeInUp>

          {/* Wallet Balance Card */}
          <FadeInUp delay={0.1}>
            <div className="group relative bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 hover:border-[#533afd]/50 hover:shadow-lg hover:shadow-[#533afd]/10 transition-all duration-300">
              <h2 className="text-sm font-medium text-[#a6a6a6] mb-4 text-center uppercase tracking-widest">
                Wallet Balance
              </h2>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent mb-2">
                ${(user.wallet_balance ?? 0).toLocaleString()}
              </div>
              <p className="text-[#666] text-xs mb-4 text-center">
                Available for contributions
              </p>
              <div className="space-y-2">
                <Link
                  href="/goals"
                  className="block w-full bg-gradient-to-r from-[#533afd] to-[#665efd] hover:shadow-lg hover:shadow-[#533afd]/30 text-white text-center py-2.5 px-4 rounded-xl font-medium transition-all hover:-translate-y-0.5 text-sm"
                >
                  Contribute
                </Link>
                <button className="block w-full bg-white/5 hover:bg-white/10 border border-white/8 text-white text-center py-2.5 px-4 rounded-xl font-medium transition-all text-sm">
                  Add Funds
                </button>
              </div>
            </div>
          </FadeInUp>

          {/* Goals Summary Card */}
          <FadeInUp delay={0.2}>
            <div className="group relative bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 hover:border-[#533afd]/50 hover:shadow-lg hover:shadow-[#533afd]/10 transition-all duration-300">
              <h2 className="text-sm font-medium text-[#a6a6a6] mb-4 text-center uppercase tracking-widest">
                Goals Overview
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#666] text-sm">Active Goals</span>
                  <span className="font-semibold text-white">{activeGoals.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#666] text-sm">Total Goals</span>
                  <span className="font-semibold text-white">{goals.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#666] text-sm">Completion Rate</span>
                  <span className="font-semibold text-[#10b981]">{completionRate}%</span>
                </div>
              </div>
              <Link
                href="/goals"
                className="block w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/8 text-white text-center py-2.5 px-4 rounded-xl font-medium transition-all text-sm"
              >
                View All Goals
              </Link>
            </div>
          </FadeInUp>
        </div>

        {/* Active Goals Section */}
        <FadeIn className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Active Goals</h2>
            <Link href="/goals" className="text-[#533afd] hover:text-[#a855f7] text-sm font-medium transition-colors">
              View All →
            </Link>
          </div>
          {activeGoals.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGoals.slice(0, 3).map((goal, i) => (
                <StaggerItem key={goal.id} index={i}>
                  <GoalCard goal={goal} onContribute={() => {}} />
                </StaggerItem>
              ))}
            </div>
          ) : (
            <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-[#a6a6a6] mb-4">No active goals yet</p>
              <Link
                href="/goals"
                className="inline-block bg-gradient-to-r from-[#533afd] to-[#665efd] hover:shadow-lg hover:shadow-[#533afd]/30 text-white px-6 py-3 rounded-xl font-medium transition-all hover:-translate-y-0.5"
              >
                Create Your First Goal
              </Link>
            </div>
          )}
        </FadeIn>

        {/* Recent Transactions */}
        <FadeIn>
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <TransactionHistory transactions={transactions} limit={5} />
        </FadeIn>
      </div>
    </div>
  );
}
