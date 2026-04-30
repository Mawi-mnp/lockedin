'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api, User } from '@/lib/api';
import { FadeIn, FadeInUp } from '@/components/animations';
import CommitmentScore from '@/components/CommitmentScore';
import Mascot from '@/components/Mascot';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    is_co_founder: false,
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email,
          is_co_founder: userData.is_co_founder ?? false,
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Note: This would need an update profile endpoint
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(prev => prev ? { ...prev, ...formData } : null);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Note: This would need a delete account endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      api.logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const handleLogout = () => {
    api.logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#533afd]/30 border-t-[#533afd] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a6a6a6] text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <FadeInUp className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Profile <span className="bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent">Settings</span>
              </h1>
              <p className="text-[#a6a6a6]">Manage your account, subscription, and preferences</p>
            </div>
            <Mascot expression="working" size="lg" />
          </div>
        </FadeInUp>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Commitment Score Card */}
          <FadeInUp delay={0}>
            <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-medium text-[#a6a6a6] mb-4 text-center uppercase tracking-widest">
                Commitment Score
              </h2>
              <CommitmentScore score={user.commitment_score ?? 0} size="lg" />
              <div className="mt-4 text-center">
                <p className="text-xs text-[#666]">
                  {(user.commitment_score ?? 0) >= 80
                    ? '🏆 Champion'
                    : (user.commitment_score ?? 0) >= 60
                    ? '🎯 Achiever'
                    : (user.commitment_score ?? 0) >= 40
                    ? '📈 Builder'
                    : '🌱 Starter'}
                </p>
              </div>
            </div>
          </FadeInUp>

          {/* Wallet Card */}
          <FadeInUp delay={0.1}>
            <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-medium text-[#a6a6a6] mb-4 text-center uppercase tracking-widest">
                Wallet Balance
              </h2>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent mb-2">
                ${(user.wallet_balance ?? 0).toLocaleString()}
              </div>
              <p className="text-[#666] text-xs text-center">
                Available for goal contributions
              </p>
              <Link
                href="/goals"
                className="block w-full mt-4 bg-gradient-to-r from-[#533afd] to-[#665efd] hover:shadow-lg hover:shadow-[#533afd]/30 text-white text-center py-2.5 px-4 rounded-xl font-medium transition-all hover:-translate-y-0.5 text-sm"
              >
                Browse Goals
              </Link>
            </div>
          </FadeInUp>

          {/* Account Status */}
          <FadeInUp delay={0.2}>
            <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-medium text-[#a6a6a6] mb-4 text-center uppercase tracking-widest">
                Account Status
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#666] text-sm">Member Since</span>
                  <span className="text-white text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#666] text-sm">Co-Founder</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_co_founder 
                      ? 'bg-[#533afd]/20 text-[#533afd]' 
                      : 'bg-white/5 text-[#666]'
                  }`}>
                    {user.is_co_founder ? '✓ Active' : 'Not Set'}
                  </span>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>

        {/* Account Settings */}
        <FadeInUp>
          <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Account Information</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-sm text-[#533afd] hover:text-[#a855f7] transition-colors"
              >
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a6a6a6] mb-2">
                  Username
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd] transition-colors"
                  />
                ) : (
                  <div className="text-white py-3">{user.username}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a6a6a6] mb-2">
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd] transition-colors"
                  />
                ) : (
                  <div className="text-white py-3">{user.email}</div>
                )}
              </div>

              {editMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 pt-4"
                >
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/8 text-white py-3 px-4 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-[#533afd] to-[#665efd] hover:shadow-lg hover:shadow-[#533afd]/30 disabled:opacity-50 text-white py-3 px-4 rounded-xl font-medium transition-all hover:-translate-y-0.5"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </FadeInUp>

        {/* Subscription Management */}
        <FadeInUp>
          <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">Subscription</h2>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#533afd]/10 to-[#a855f7]/10 border border-[#533afd]/20 rounded-xl mb-4">
              <div>
                <h3 className="font-medium mb-1">Free Plan</h3>
                <p className="text-sm text-[#a6a6a6]">Basic Commitment Score tracking</p>
              </div>
              <Link
                href="/pricing"
                className="bg-gradient-to-r from-[#533afd] to-[#665efd] hover:shadow-lg hover:shadow-[#533afd]/30 text-white px-6 py-2.5 rounded-xl font-medium transition-all hover:-translate-y-0.5 text-sm"
              >
                Upgrade to Pro
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-[#a6a6a6]">
                <span className="text-white font-medium">3</span> active goals max
              </div>
              <div className="text-[#a6a6a6]">
                <span className="text-white font-medium">Basic</span> analytics
              </div>
              <div className="text-[#a6a6a6]">
                <span className="text-white font-medium">Community</span> support
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Account Controls */}
        <FadeInUp>
          <div className="bg-[#0a0a0a] border border-white/8 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">Account Controls</h2>
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚪</span>
                  <div className="text-left">
                    <div className="font-medium">Log Out</div>
                    <div className="text-sm text-[#a6a6a6]">Sign out of your account</div>
                  </div>
                </div>
                <span className="text-[#a6a6a6] group-hover:text-white transition-colors">→</span>
              </button>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🗑️</span>
                    <div className="text-left">
                      <div className="font-medium text-red-400">Delete Account</div>
                      <div className="text-sm text-[#a6a6a6]">Permanently remove your data</div>
                    </div>
                  </div>
                  <span className="text-[#a6a6a6] group-hover:text-red-400 transition-colors">→</span>
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                >
                  <p className="text-red-400 mb-4">
                    Are you sure? This action cannot be undone and will permanently delete all your data.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/8 text-white py-2.5 px-4 rounded-xl font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-xl font-medium transition-all"
                    >
                      Delete Account
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </FadeInUp>

        {/* Navigation */}
        <FadeInUp>
          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="text-[#a6a6a6] hover:text-white transition-colors text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
