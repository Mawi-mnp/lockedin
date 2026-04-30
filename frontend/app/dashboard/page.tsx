'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CommitmentScore from '@/components/CommitmentScore';
import GoalCard from '@/components/GoalCard';
import TransactionHistory from '@/components/TransactionHistory';
import Mascot from '@/components/Mascot';
import { api, User, Goal, Transaction } from '@/lib/api';

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
        // Clear token on auth error
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const activeGoals = goals.filter((g) => g.status === 'active');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.username}!</p>
          </div>
          <Mascot 
            expression={(user.commitment_score ?? 0) >= 70 ? 'celebrating' : (user.commitment_score ?? 0) >= 50 ? 'working' : 'nudge'} 
            size="lg" 
          />
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Commitment Score Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Your Commitment Score
            </h2>
            <CommitmentScore score={user.commitment_score ?? 0} size="lg" />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {(user.commitment_score ?? 0) >= 80
                  ? 'Excellent! You\'re a top performer.'
                  : (user.commitment_score ?? 0) >= 60
                  ? 'Good progress! Keep it up.'
                  : (user.commitment_score ?? 0) >= 40
                  ? 'Room for improvement. Stay committed!'
                  : 'Let\'s build your commitment together.'}
              </p>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Wallet Balance
            </h2>
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              ${(user.wallet_balance ?? 0).toLocaleString()}
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Available for goal contributions
            </p>
            <div className="space-y-2">
              <Link
                href="/goals"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 px-4 rounded-md font-medium transition-colors"
              >
                Contribute to Goals
              </Link>
              <button className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2 px-4 rounded-md font-medium transition-colors">
                Add Funds
              </button>
            </div>
          </div>

          {/* Goals Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Goals Overview
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Goals</span>
                <span className="font-semibold text-gray-900">{activeGoals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Goals</span>
                <span className="font-semibold text-gray-900">{goals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-green-600">
                  {goals.length > 0
                    ? Math.round(
                        (goals.filter((g) => g.status === 'completed').length /
                          goals.length) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
            <Link
              href="/goals"
              className="block w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2 px-4 rounded-md font-medium transition-colors"
            >
              View All Goals
            </Link>
          </div>
        </div>

        {/* Active Goals Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Goals</h2>
            <Link
              href="/goals"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          {activeGoals.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGoals.slice(0, 3).map((goal) => (
                <GoalCard key={goal.id} goal={goal} onContribute={() => {}} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 mb-4">
                You don't have any active goals yet
              </p>
              <Link
                href="/goals"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Create Your First Goal
              </Link>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h2>
          <TransactionHistory transactions={transactions} limit={5} />
        </div>
      </div>
    </div>
  );
}
