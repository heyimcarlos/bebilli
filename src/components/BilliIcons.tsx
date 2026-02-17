import React from 'react';

// Illustrated coin icon matching the Billi brand style
export const CoinIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" stroke="hsl(var(--foreground))" strokeWidth="3" fill="hsl(var(--primary) / 0.15)" />
    <circle cx="32" cy="32" r="22" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
    <text x="32" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill="hsl(var(--foreground))" fontFamily="Inter, sans-serif">$</text>
  </svg>
);

// Illustrated rocket icon
export const RocketIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8C32 8 20 20 20 36C20 44 24 50 32 56C40 50 44 44 44 36C44 20 32 8 32 8Z" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="hsl(var(--primary) / 0.15)" />
    <circle cx="32" cy="30" r="4" stroke="hsl(var(--foreground))" strokeWidth="2" fill="hsl(var(--primary) / 0.3)" />
    <path d="M20 36L12 40L16 32" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="hsl(var(--primary) / 0.1)" />
    <path d="M44 36L52 40L48 32" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="hsl(var(--primary) / 0.1)" />
    <path d="M26 52L32 56L38 52" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28 56L32 62L36 56" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Illustrated thumbs up / hand icon
export const ThumbsUpIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 30H12C10 30 8 32 8 34V52C8 54 10 56 12 56H20V30Z" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinejoin="round" fill="hsl(var(--primary) / 0.15)" />
    <path d="M20 30L28 10C30 8 34 8 36 10C38 12 36 18 34 22H48C52 22 54 26 52 30L46 50C45 54 42 56 38 56H20" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="hsl(var(--primary) / 0.1)" />
  </svg>
);

// Illustrated heart icon
export const HeartIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 56L8 32C2 26 2 16 8 10C14 4 22 4 28 10L32 14L36 10C42 4 50 4 56 10C62 16 62 26 56 32L32 56Z" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="hsl(var(--primary) / 0.2)" />
  </svg>
);

// Illustrated trophy icon
export const TrophyIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8H46V28C46 36 40 44 32 44C24 44 18 36 18 28V8Z" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinejoin="round" fill="hsl(var(--primary) / 0.15)" />
    <path d="M18 14H8C8 14 6 24 14 28" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M46 14H56C56 14 58 24 50 28" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28 44V50H36V44" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M22 50H42V56H22V50Z" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinejoin="round" fill="hsl(var(--primary) / 0.1)" />
    <text x="32" y="32" textAnchor="middle" fontSize="12" fontWeight="bold" fill="hsl(var(--foreground))">1</text>
  </svg>
);

// Illustrated fire/streak icon  
export const FireIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4C32 4 16 20 16 38C16 48 23 56 32 56C41 56 48 48 48 38C48 20 32 4 32 4Z" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="hsl(var(--primary) / 0.2)" />
    <path d="M32 24C32 24 24 32 24 40C24 44 28 48 32 48C36 48 40 44 40 40C40 32 32 24 32 24Z" stroke="hsl(var(--foreground))" strokeWidth="2" fill="hsl(var(--primary) / 0.4)" />
  </svg>
);

// Illustrated star icon
export const StarIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 6L40 24L60 26L46 40L50 60L32 50L14 60L18 40L4 26L24 24L32 6Z" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="hsl(var(--primary) / 0.2)" />
  </svg>
);

// Piggy bank icon (savings)
export const PiggyBankIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="36" rx="20" ry="16" stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="hsl(var(--primary) / 0.15)" />
    <path d="M28 20C28 16 30 14 32 14C34 14 36 16 36 20" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="26" cy="32" r="2" fill="hsl(var(--foreground))" />
    <path d="M38 36C38 36 40 38 38 40" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
    <path d="M52 32L58 28" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22 48L20 56" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M42 48L44 56" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M30 12L32 8L34 12" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
