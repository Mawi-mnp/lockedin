'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Header() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/70 border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo with animated gradient */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            🦡
          </motion.div>
          <motion.div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] animate-[gradient_3s_ease_infinite]">
              CommitScore
            </span>
            {/* Hover glow effect */}
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20 blur-xl -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </motion.div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="#how-it-works" 
            className="text-sm text-gray-300 hover:text-white transition-colors duration-200 relative group"
          >
            How It Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-blue-500 group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="#features" 
            className="text-sm text-gray-300 hover:text-white transition-colors duration-200 relative group"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-blue-500 group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="#stories" 
            className="text-sm text-gray-300 hover:text-white transition-colors duration-200 relative group"
          >
            Stories
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-blue-500 group-hover:w-full transition-all duration-300" />
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login"
            className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-all duration-200 hover:bg-white/5"
          >
            Log In
          </Link>
          <Link 
            href="/register"
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 rounded-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Inline gradient animation styles */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </header>
  );
}
