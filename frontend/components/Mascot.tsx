'use client';

import { motion } from 'framer-motion';

export default function Mascot() {
  return (
    <motion.div 
      className="relative w-48 h-48 md:w-64 md:h-64"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        {/* Glow effect behind */}
        <defs>
          <radialGradient id="mascotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#533afd" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="badgerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#533afd" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        
        {/* Background glow */}
        <circle cx="100" cy="100" r="80" fill="url(#mascotGlow)" />
        
        {/* Body - friendly rounded shape */}
        <ellipse cx="100" cy="110" rx="55" ry="50" fill="url(#badgerGradient)" />
        
        {/* White belly patch */}
        <ellipse cx="100" cy="120" rx="30" ry="25" fill="#f8fafc" opacity="0.9" />
        
        {/* Head - rounded friendly shape */}
        <ellipse cx="100" cy="70" rx="45" ry="40" fill="url(#badgerGradient)" />
        
        {/* White face stripe (honey badger signature) */}
        <path d="M 65 55 Q 100 45 135 55 L 135 75 Q 100 85 65 75 Z" fill="#f8fafc" />
        
        {/* Left ear */}
        <circle cx="60" cy="35" r="12" fill="url(#badgerGradient)" />
        <circle cx="60" cy="35" r="7" fill="#4c1d95" />
        
        {/* Right ear */}
        <circle cx="140" cy="35" r="12" fill="url(#badgerGradient)" />
        <circle cx="140" cy="35" r="7" fill="#4c1d95" />
        
        {/* Left eye - big friendly */}
        <ellipse cx="82" cy="68" rx="9" ry="10" fill="#1e1b4b" />
        <circle cx="85" cy="65" r="4" fill="white" />
        
        {/* Right eye - big friendly */}
        <ellipse cx="118" cy="68" rx="9" ry="10" fill="#1e1b4b" />
        <circle cx="121" cy="65" r="4" fill="white" />
        
        {/* Nose - small cute */}
        <ellipse cx="100" cy="80" rx="6" ry="4" fill="#1e1b4b" />
        
        {/* Friendly smile */}
        <path d="M 90 90 Q 100 98 110 90" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
        
        {/* Cheek blush - left */}
        <ellipse cx="72" cy="85" rx="6" ry="4" fill="#f472b6" opacity="0.4" />
        
        {/* Cheek blush - right */}
        <ellipse cx="128" cy="85" rx="6" ry="4" fill="#f472b6" opacity="0.4" />
        
        {/* Small arms - determined pose */}
        <ellipse cx="55" cy="110" rx="8" ry="15" fill="url(#badgerGradient)" transform="rotate(-20 55 110)" />
        <ellipse cx="145" cy="110" rx="8" ry="15" fill="url(#badgerGradient)" transform="rotate(20 145 110)" />
        
        {/* Cape - commitment hero theme */}
        <path d="M 70 100 Q 50 130 45 150 L 65 145 Q 75 130 80 115" fill="#a855f7" opacity="0.8" />
        <path d="M 130 100 Q 150 130 155 150 L 135 145 Q 125 130 120 115" fill="#a855f7" opacity="0.8" />
        
        {/* Determined eyebrow - left */}
        <path d="M 75 58 Q 82 54 88 57" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Determined eyebrow - right */}
        <path d="M 112 57 Q 118 54 125 58" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      
      {/* Floating animation */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
