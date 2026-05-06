'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Animated Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <motion.div 
            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#533afd] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#533afd]/30"
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Honey badger icon */}
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
              <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <ellipse cx="12" cy="16" rx="7" ry="5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="10" cy="7" r="1.5" fill="currentColor"/>
              <circle cx="14" cy="7" r="1.5" fill="currentColor"/>
              <path d="M11 10 Q12 11 13 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#533afd] to-[#a855f7] blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
          </motion.div>
          
          {/* Logo Text with Gradient */}
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-white via-[#e0e7ff] to-[#a855f7] bg-clip-text text-transparent group-hover:from-[#a855f7] group-hover:via-[#c4b5fd] group-hover:to-white transition-all duration-300">
              CommitScore
            </span>
            <span className="text-[10px] text-[#666] font-medium tracking-wider uppercase -mt-1">
              Build Accountability
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { name: 'How It Works', href: '#how-it-works' },
            { name: 'Features', href: '#features' },
            { name: 'Stories', href: '#testimonials' },
          ].map((item, i) => (
            <motion.a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-[#a6a6a6] hover:text-white transition-colors relative group"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#533afd] to-[#a855f7] group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            href="/login"
            className="text-sm font-medium text-[#a6a6a6] hover:text-white transition-colors px-4 py-2"
          >
            Log In
          </Link>
          <Link 
            href="/register"
            className="relative px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#533afd] to-[#a855f7] rounded-full hover:shadow-lg hover:shadow-[#533afd]/30 transition-all hover:-translate-y-0.5"
          >
            Sign Up
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#533afd] to-[#a855f7] blur-md opacity-0 hover:opacity-50 transition-opacity -z-10" />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
