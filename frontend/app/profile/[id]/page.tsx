'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CommitmentScore from '@/components/CommitmentScore';
import GoalCard from '@/components/GoalCard';
import CoFounderRequest from '@/components/CoFounderRequest';
import { api, User, Goal } from '@/lib/api';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const actualUserId = userId === 'me' ? 'me' : parseInt(userId);
        const userData = await api.getProfile(actualUserId);
        setUser(userData);
        const userGoals = await api.getUserGoals(userData.id);
        setGoals(userGoals);
        if (userId === 'me') {
          setIsCurrentUser(true);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The user you are looking for does not exist.</p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-3xl font-bold text-indigo-600">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4 flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-600">{user.email}</p>
                {user.is_co_founder && (
                  <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Co-Founder
                  </span>
                )}
              </div>
              {!isCurrentUser && (
                <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                  <CoFounderRequest
                    userId={user.id}
                    username={user.username}
                    commitmentScore={user.commitment_score ?? 0}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Commitment Score</h2>
            <CommitmentScore score={user.commitment_score ?? 0} size="lg" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Goals Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Goals</span>
                <span className="font-semibold text-gray-900">{activeGoals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Goals</span>
                <span className="font-semibold text-green-600">{completedGoals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Goals</span>
                <span className="font-semibold text-gray-900">{goals.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Balance</h2>
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              ${(user.wallet_balance ?? 0).toLocaleString()}
            </div>
            <p className="text-gray-600 text-sm">
              {isCurrentUser ? 'Available for contributions' : 'User wallet balance'}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{user.username} Goals</h2>
          {goals.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">{user.username} has not created any goals yet.</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link
            href={isCurrentUser ? '/dashboard' : '/'}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back to {isCurrentUser ? 'Dashboard' : 'Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
