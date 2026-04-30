'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeIn, FadeInUp, StaggerItem } from '@/components/animations';
import { api } from '@/lib/api';

const PLANS = [
  {
    tier: 'free',
    name: 'Starter',
    price: 0,
    description: 'Build your foundation',
    features: [
      'Basic Commitment Score tracking',
      'Up to 3 active goals',
      'Monthly contribution limits',
      'Community support',
      'Basic analytics',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 19,
    description: 'For serious entrepreneurs',
    features: [
      'Everything in Starter',
      'Unlimited goals',
      'No contribution limits',
      'Priority support',
      'Advanced analytics & insights',
      'Co-founder matching',
      'Custom milestones',
      'Export data',
    ],
    cta: 'Start 7-Day Free Trial',
    popular: true,
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 99,
    description: 'For teams & organizations',
    features: [
      'Everything in Pro',
      'Team accounts (up to 10)',
      'White-label dashboard',
      'API access',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantee',
      'Advanced security',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: string) => {
    if (tier === 'free') {
      router.push('/register');
      return;
    }
    
    setLoading(tier);
    try {
      const session = await api.createCheckoutSession({ 
        tier: tier as 'pro' | 'enterprise',
        success_url: `${window.location.origin}/dashboard?upgraded=true`,
        cancel_url: `${window.location.origin}/pricing`,
      });
      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(83,58,253,0.15)_0%,rgba(168,85,247,0.08)_40%,transparent_70%)] blur-[60px]" />
        <div className="absolute top-[20%] -right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(168,85,247,0.1)_0%,transparent_70%)] blur-[60px]" />
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
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-[#a6a6a6] hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/login" className="text-sm text-[#a6a6a6] hover:text-white transition-colors">
                Log In
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#533afd] to-[#665efd] rounded-full hover:shadow-lg hover:shadow-[#533afd]/30 transition-all hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <FadeInUp className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Invest in Your <span className="bg-gradient-to-r from-[#533afd] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">Commitment</span>
          </h1>
          <p className="text-xl text-[#a6a6a6] leading-relaxed">
            Choose the plan that matches your ambition. Start free, upgrade when you&apos;re ready to go all in.
          </p>
        </FadeInUp>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan, i) => (
            <FadeInUp key={plan.tier} delay={i * 0.1}>
              <div 
                className={`relative group bg-[#0a0a0a] border rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular 
                    ? 'border-[#533afd] shadow-lg shadow-[#533afd]/20' 
                    : 'border-white/8 hover:border-[#533afd]/50 hover:shadow-lg hover:shadow-[#533afd]/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#533afd] to-[#a855f7] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-[#666] mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    {plan.price > 0 && <span className="text-[#666] ml-2">/month</span>}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                        plan.popular ? 'bg-[#533afd]/20 text-[#533afd]' : 'bg-white/10 text-white'
                      }`}>
                        ✓
                      </span>
                      <span className="text-sm text-[#a6a6a6]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={loading === plan.tier}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all hover:-translate-y-0.5 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#533afd] to-[#665efd] hover:shadow-lg hover:shadow-[#533afd]/30 text-white'
                      : 'bg-white/5 hover:bg-white/10 border border-white/8 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none`}
                >
                  {loading === plan.tier ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </FadeInUp>
          ))}
        </div>

        {/* FAQ Section */}
        <FadeIn className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, you can cancel your subscription at any time. You&apos;ll retain access until the end of your billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, MasterCard, Amex) and process payments securely through Stripe.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! Pro plan comes with a 7-day free trial. No charge until the trial ends.',
              },
              {
                q: 'Can I upgrade or downgrade later?',
                a: 'Absolutely. You can change your plan anytime from your dashboard settings.',
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0a0a0a] border border-white/8 rounded-xl p-6"
              >
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-[#a6a6a6]">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeInUp className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#533afd]/10 to-[#a855f7]/10 border border-[#533afd]/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-3">
              Ready to lock in your commitment?
            </h2>
            <p className="text-[#a6a6a6] mb-6">
              Join thousands of entrepreneurs building their reputation.
            </p>
            <Link
              href="/register"
              className="inline-block bg-gradient-to-r from-[#533afd] to-[#665efd] hover:shadow-lg hover:shadow-[#533afd]/30 text-white px-8 py-3 rounded-xl font-medium transition-all hover:-translate-y-0.5"
            >
              Start Free Today
            </Link>
          </div>
        </FadeInUp>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[#666]">
          <p>© 2026 LockedIn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
