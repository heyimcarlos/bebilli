import React from 'react';

interface BilliLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'default' | 'white';
}

const BilliLogo: React.FC<BilliLogoProps> = ({ className = '', size = 48, showText = false, variant = 'default' }) => {
  const bColor = variant === 'white' ? '#FFFFFF' : '#C86A12';
  const cutoutColor = variant === 'white' ? '#E8751A' : 'white';
  const textColor = variant === 'white' ? 'text-white' : 'text-foreground';
  const subColor = variant === 'white' ? 'text-white/70' : 'text-muted-foreground';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top italic slant accent extending from B top-right */}
        <path
          d="M88 30L148 18"
          stroke={bColor}
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Main B body */}
        <path
          d="M62 32H110C130 32 146 44 146 62C146 74 140 82 130 86C142 90 150 102 150 116C150 136 134 150 110 150H62V32Z"
          fill={bColor}
        />
        
        {/* B upper hole */}
        <path
          d="M88 52H106C114 52 120 58 120 66C120 74 114 80 106 80H88V52Z"
          fill={cutoutColor}
        />
        
        {/* B lower hole */}
        <path
          d="M88 98H110C118 98 124 104 124 114C124 124 118 130 110 130H88V98Z"
          fill={cutoutColor}
        />

        {/* Wing - attached to left side of B */}
        <g transform="translate(18, 78)">
          {/* Bottom feather (longest, curves down) */}
          <path
            d="M48 30C40 30 28 34 18 38C10 42 4 46 2 48C6 50 12 48 20 44C28 40 38 34 48 30Z"
            fill="white"
            stroke="#222"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Middle feather */}
          <path
            d="M44 20C34 18 22 20 14 24C8 28 4 32 4 34C8 34 14 32 22 28C30 24 38 22 44 20Z"
            fill="white"
            stroke="#222"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Top feather (shortest) */}
          <path
            d="M40 12C32 10 22 12 16 16C12 18 10 22 14 22C18 22 28 18 40 12Z"
            fill="white"
            stroke="#222"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col ml-1">
          <span className={`font-black ${textColor} leading-tight tracking-tight`} style={{ fontSize: size * 0.55 }}>
            Billi
          </span>
          <span className={`font-medium ${subColor}`} style={{ fontSize: size * 0.22, marginTop: -2 }}>
            bilionaire
          </span>
        </div>
      )}
    </div>
  );
};

export default BilliLogo;
