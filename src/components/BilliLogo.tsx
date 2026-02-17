import React from 'react';

interface BilliLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'default' | 'white';
}

const BilliLogo: React.FC<BilliLogoProps> = ({ className = '', size = 48, showText = false, variant = 'default' }) => {
  const bColor = variant === 'white' ? '#FFFFFF' : '#E8751A';
  const cutoutColor = variant === 'white' ? '#E8751A' : 'white';
  const textColor = variant === 'white' ? 'text-white' : 'text-foreground';
  const subColor = variant === 'white' ? 'text-white/70' : 'text-muted-foreground';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top slant accent */}
        <path
          d="M95 28L160 42"
          stroke={bColor}
          strokeWidth="22"
          strokeLinecap="round"
        />

        {/* Main B shape */}
        <path
          d="M70 40H120C142 40 158 54 158 72C158 84 152 92 142 96C154 100 162 112 162 126C162 146 146 160 120 160H70V40Z"
          fill={bColor}
        />
        {/* B upper cutout */}
        <path
          d="M96 62H114C122 62 128 68 128 76C128 84 122 90 114 90H96V62Z"
          fill={cutoutColor}
        />
        {/* B lower cutout */}
        <path
          d="M96 108H118C128 108 134 114 134 124C134 134 128 140 118 140H96V108Z"
          fill={cutoutColor}
        />

        {/* Wing - 3 feathers */}
        <g transform="translate(30, 88)">
          <path
            d="M52 28C44 26 32 28 22 32C14 36 8 40 6 44C4 48 8 50 14 48C22 44 34 38 52 28Z"
            fill="white"
            stroke="#1A1A1A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M48 18C38 14 26 14 16 18C10 22 6 26 6 30C6 34 10 34 16 32C24 28 36 24 48 18Z"
            fill="white"
            stroke="#1A1A1A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M44 10C36 6 26 4 18 8C12 12 12 16 16 18C22 18 34 14 44 10Z"
            fill="white"
            stroke="#1A1A1A"
            strokeWidth="2.5"
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
