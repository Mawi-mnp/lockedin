'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import SmoothScroll from '@/components/SmoothScroll';
import { FadeIn, FadeInUp, StaggerContainer, StaggerItem, ScaleIn, SlideInLeft, SlideInRight } from '@/components/animations';
import { motion, useScroll, useTransform } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import StaggerGrid from '@/components/animations/StaggerGrid';
import HoverCard from '@/components/animations/HoverCard';
import HoverButton from '@/components/animations/HoverButton';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll();
  
  // Parallax effects for hero orbs
  const heroOrbY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  const heroOrbScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroOrbRotate = useTransform(scrollYProgress, [0, 0.2], [0, 10]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const howItWorksCards = [
    {
      number: '1',
      icon: '🎯',
      title: 'Set Your Goal',
      description: 'Define what you\'re committing to — a savings target, a business milestone, or a personal challenge. Set your deadline and stake your claim.',
    },
    {
      number: '2',
      icon: '💰',
      title: 'Stake Commitment',
      description: 'Put skin in the game. Your financial contributions prove you\'re serious. Every deposit builds your reputation and your future.',
    },
    {
      number: '3',
      icon: '📈',
      title: 'Build Your Score',
      description: 'Consistent contributions raise your Commitment Score (0-100). High scorers unlock partnerships and attract serious co-founders.',
    },
  ];

  const stats = [
    { value: '100%', label: 'Accountability' },
    { value: '0-100', label: 'Score Range' },
    { value: '24/7', label: 'Progress Tracking' },
    { value: '∞', label: 'Goals Possible' },
  ];

  const testimonials = [
    {
      rating: '★★★★★',
      quote: 'My CommitScore of 92 helped me find a co-founder who knew I was serious. We just closed our seed round. This platform is gold.',
      name: 'Alice Chen',
      score: 92,
      role: 'Tech Startup Founder',
      initials: 'AC',
    },
    {
      rating: '★★★★★',
      quote: 'Finally, a way to prove I\'m not just another idea guy. My score went from 45 to 78 in six months. Partners take me seriously now.',
      name: 'Bob Martinez',
      score: 78,
      role: 'E-commerce Venture',
      initials: 'BM',
    },
    {
      rating: '★★★★★',
      quote: 'The accountability is real. Knowing my contributions affect my score keeps me on track. Best decision for my business discipline.',
      name: 'David Kim',
      score: 65,
      role: 'SaaS Builder',
      initials: 'DK',
    },
  ];

  const scoreTiers = [
    { icon: '✓', color: '#10b981', title: '90+ Score', desc: 'Champion — Consistent contributor, highly sought after' },
    { icon: '●', color: '#a855f7', title: '70-89 Score', desc: 'Achiever — Solid track record, reliable partner' },
    { icon: '◆', color: '#f59e0b', title: '50-69 Score', desc: 'Builder — Growing reputation, room to prove' },
    { icon: '■', color: '#ef4444', title: 'Below 50', desc: 'Starter — Time to demonstrate commitment' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Fixed animated gradient orbs background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px]"
          style={{ y: heroOrbY, scale: heroOrbScale, rotate: heroOrbRotate }}
        >
          <div className="w-full h-full bg-[radial-gradient(circle,rgba(83,58,253,0.2)_0%,rgba(168,85,247,0.1)_40%,transparent_70%)] blur-[60px]" />
        </motion.div>
        <motion.div 
          className="absolute top-[20%] right-0 w-[400px] h-[400px]"
          style={{ x: useTransform(scrollYProgress, [0, 0.3], [0, -50]) }}
        >
          <div className="w-full h-full bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%)] blur-[60px]" />
        </motion.div>
        <motion.div 
          className="absolute bottom-0 left-0 w-[500px] h-[500px]"
          style={{ x: useTransform(scrollYProgress, [0.5, 1], [0, 100]) }}
        >
          <div className="w-full h-full bg-[radial-gradient(circle,rgba(83,58,253,0.1)_0%,transparent_70%)] blur-[60px]" />
        </motion.div>
      </div>

      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight group">
            <motion.div 
              className="w-7 h-7 bg-gradient-to-br from-[#533afd] to-[#a855f7] rounded-md flex items-center justify-center text-base"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              🦡
            </motion.div>
            <span className="group-hover:text-[#a855f7] transition-colors">CommitScore</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['How It Works', 'Features', 'Stories'].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-[#a6a6a6] hover:text-white transition-colors"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <HoverButton href="/login" variant="secondary" className="hidden sm:inline-flex">
              Log In
            </HoverButton>
            <HoverButton href="/register" variant="primary">
              Sign Up
            </HoverButton>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Parallax */}
      <section className="relative pt-[140px] pb-20 px-6 text-center">
        <div className="relative z-10 max-w-[800px] mx-auto">
          <FadeInUp delay={0.1}>
            {/* Mascot */}
            <div className="mb-8 animate-[float_3s_ease-in-out_infinite]">
              <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] mx-auto drop-shadow-[0_0_20px_rgba(83,58,253,0.3)]">
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#533afd' }} />
                    <stop offset="100%" style={{ stopColor: '#a855f7' }} />
                  </linearGradient>
                </defs>
                <ellipse cx="60" cy="70" rx="35" ry="30" fill="#0a0a0a" stroke="url(#bodyGradient)" strokeWidth="2.5" filter="url(#glow)"/>
                <circle cx="60" cy="40" r="25" fill="#0a0a0a" stroke="url(#bodyGradient)" strokeWidth="2.5" filter="url(#glow)"/>
                <ellipse cx="50" cy="38" rx="5" ry="6" fill="#ffffff"/>
                <ellipse cx="70" cy="38" rx="5" ry="6" fill="#ffffff"/>
                <circle cx="50" cy="38" r="3" fill="#0a0a0a"/>
                <circle cx="70" cy="38" r="3" fill="#0a0a0a"/>
                <path d="M45 30 L55 33" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M75 30 L65 33" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round"/>
                <ellipse cx="60" cy="48" rx="4" ry="3" fill="#ffffff"/>
                <path d="M52 55 Q60 60 68 55" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="38" cy="25" r="6" fill="#0a0a0a" stroke="url(#bodyGradient)" strokeWidth="2.5"/>
                <circle cx="82" cy="25" r="6" fill="#0a0a0a" stroke="url(#bodyGradient)" strokeWidth="2.5"/>
                <path d="M30 65 Q20 75 25 85" stroke="#0a0a0a" strokeWidth="9" strokeLinecap="round"/>
                <path d="M90 65 Q100 75 95 85" stroke="#0a0a0a" strokeWidth="9" strokeLinecap="round"/>
                <polygon points="60,95 63,103 72,103 65,109 67,118 60,113 53,118 55,109 48,103 57,103" fill="url(#bodyGradient)" filter="url(#glow)"/>
              </svg>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Build Accountability with<br />
              <span className="bg-gradient-to-r from-[#533afd] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
                Commitment Score
              </span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <p className="text-lg md:text-xl text-[#a6a6a6] max-w-[580px] mx-auto mb-8 leading-relaxed">
              Track your goals, stake your commitment, and build a reputation for following through.
              Connect with entrepreneurs who prove they&apos;re all in.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <HoverButton href="/register" variant="primary" className="px-8 py-4 text-base">
                Get Started Free
              </HoverButton>
              <HoverButton href="#how-it-works" variant="secondary" className="px-8 py-4 text-base">
                Learn More
              </HoverButton>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.5}>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-[#666]">
              {['No credit card required', '0-100 Score System', 'Find co-founders'].map((item, i) => (
                <motion.div 
                  key={item}
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-[#10b981] font-bold">✓</span>
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#0a0a0a] border-y border-white/5 py-10 px-6">
        <div className="max-w-[1200px] mx-auto">
          <StaggerGrid staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((stat) => (
              <motion.div key={stat.label} className="text-center" whileHover={{ scale: 1.05 }}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-[#666] font-medium mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <FadeInUp>
            <div className="text-center max-w-[600px] mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                How <span className="bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent">It Works</span>
              </h2>
              <p className="text-[#a6a6a6] text-lg">Three simple steps to build your entrepreneur reputation</p>
            </div>
          </FadeInUp>

          <StaggerGrid staggerDelay={0.15} className="grid md:grid-cols-3 gap-6">
            {howItWorksCards.map((card) => (
              <HoverCard key={card.number} className="group relative bg-[#0f0f0f] border border-white/8 rounded-2xl p-8">
                <div className="absolute top-4 right-4 w-7 h-7 bg-[#0a0a0a] border border-white/8 rounded-full flex items-center justify-center text-xs font-bold text-[#666] font-mono">
                  {card.number}
                </div>
                <div className="w-11 h-11 bg-gradient-to-br from-[#533afd]/20 to-[#a855f7]/10 border border-white/5 rounded-lg flex items-center justify-center text-2xl mb-5">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
                <p className="text-[#a6a6a6] leading-relaxed">{card.description}</p>
              </HoverCard>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Score Visualization */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-[#0a0a0a] border-y border-white/5">
        <div className="max-w-[1000px] mx-auto grid md:grid-cols-2 gap-12 items-center">
          <FadeInUp>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-5">
                Your Score is Your <span className="bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent">Social Proof</span>
              </h2>
              <p className="text-[#a6a6a6] mb-6 leading-relaxed">
                In the entrepreneur world, trust is everything. Your Commitment Score transforms
                your financial discipline into a verifiable reputation metric.
              </p>
              <ul className="space-y-3 mb-8">
                {scoreTiers.map((tier, i) => (
                  <motion.li 
                    key={tier.title}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 5 }}
                  >
                    <span 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                    >
                      {tier.icon}
                    </span>
                    <span>
                      <strong className="text-white">{tier.title}:</strong> {tier.desc}
                    </span>
                  </motion.li>
                ))}
              </ul>
              <HoverButton href="/register" variant="primary">
                Start Building Your Score
              </HoverButton>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <HoverCard className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-8 flex flex-col items-center justify-center">
              <motion.div 
                className="relative w-[220px] h-[220px] rounded-full flex items-center justify-center shadow-lg"
                style={{ 
                  background: 'conic-gradient(#533afd 0% 75%, #a855f7 75% 85%, #0a0a0a 85% 100%)',
                  boxShadow: '0 0 40px rgba(83, 58, 253, 0.2)'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute w-[170px] h-[170px] bg-[#0f0f0f] rounded-full border border-white/5" />
                <motion.div 
                  className="relative z-10 text-6xl font-bold font-mono tracking-tighter"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  75
                </motion.div>
              </motion.div>
              <div className="text-sm text-[#666] font-medium mt-4">Example Score — Achiever Level</div>
            </HoverCard>
          </FadeInUp>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <FadeInUp>
            <div className="text-center max-w-[600px] mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Entrepreneurs <span className="bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent">Trust CommitScore</span>
              </h2>
              <p className="text-[#a6a6a6] text-lg">See how committed founders are building their reputations</p>
            </div>
          </FadeInUp>

          <StaggerGrid staggerDelay={0.15} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <HoverCard key={testimonial.name} className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-7">
                <div className="text-[#fbbf24] text-lg mb-4 tracking-widest">{testimonial.rating}</div>
                <p className="text-[#a6a6a6] leading-relaxed mb-5">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#533afd] to-[#a855f7] flex items-center justify-center text-sm font-bold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{testimonial.name}</h4>
                    <p className="text-xs text-[#666]">Score: {testimonial.score} — {testimonial.role}</p>
                  </div>
                </div>
              </HoverCard>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#0a0a0a] border-t border-white/8">
        <FadeInUp>
          <div className="max-w-[600px] mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Build <span className="bg-gradient-to-r from-[#533afd] to-[#a855f7] bg-clip-text text-transparent">Better Habits?</span>
            </h2>
            <p className="text-[#666] mb-8">Join thousands of entrepreneurs who prove their commitment every day.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-[420px] mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 bg-[#0f0f0f] border border-white/8 rounded-full text-white placeholder-[#666] focus:outline-none focus:border-[#533afd] focus:ring-2 focus:ring-[#533afd]/20 transition-all"
                required
              />
              <HoverButton variant="primary" className="px-6 py-4 text-sm">
                Create Account
              </HoverButton>
            </form>
          </div>
        </FadeInUp>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-12">
            <FadeInUp>
              <div className="max-w-[280px]">
                <div className="flex items-center gap-3 text-base font-semibold mb-4">
                  <span>🦡</span>
                  <span>CommitScore</span>
                </div>
                <p className="text-sm text-[#666] leading-relaxed">
                  Build accountability, achieve goals, and connect with entrepreneurs who are all in.
                </p>
              </div>
            </FadeInUp>
            
            {['PRODUCT', 'COMPANY', 'LEGAL'].map((category, i) => (
              <FadeInUp key={category} delay={0.1 * i}>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 font-mono">{category}</h4>
                <ul className="space-y-3">
                  {['Features', 'Pricing', 'API', 'Integrations'].slice(0, 4 - i).map((item) => (
                    <li key={item}>
                      <motion.a 
                        href="#" 
                        className="text-sm text-[#666] hover:text-white transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        {item}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </FadeInUp>
            ))}
          </div>
          <FadeInUp>
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5">
              <p className="text-xs text-[#666]">© 2026 CommitScore. All rights reserved.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                {['𝕏', 'in', '◉'].map((icon, i) => (
                  <motion.a
                    key={icon}
                    href="#"
                    className="text-[#666] hover:text-[#533afd] transition-colors text-lg no-underline"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </FadeInUp>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      {mounted && (
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(2deg); }
          }
        `}</style>
      )}
    </div>
  );
}
