import React from 'react';

interface BilliLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

const BilliLogo: React.FC<BilliLogoProps> = ({ className = '', size = 48, showText = false }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Wing */}
        <g transform="translate(8, 42)">
          <path d="M28 24C24 20 18 16 10 16C6 16 2 18 2 22C2 26 6 30 12 30L28 24Z" fill="white" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M24 18C20 14 14 10 8 12C4 14 4 18 8 20L24 18Z" fill="white" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinejoin="round" />
          <path d="M22 12C18 8 14 6 10 8C6 10 8 14 12 14L22 12Z" fill="white" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinejoin="round" />
        </g>

        {/* Letter B */}
        <path d="M40 16H72C82 16 92 22 92 36C92 44 88 48 82 50C90 52 96 58 96 68C96 82 86 90 72 90H40V16Z" fill="hsl(30, 100%, 50%)" />
        <path d="M56 16V90" stroke="hsl(30, 100%, 50%)" strokeWidth="0" />
        {/* B cutouts */}
        <path d="M56 30H68C72 30 76 34 76 38C76 42 72 46 68 46H56V30Z" fill="hsl(var(--background))" />
        <path d="M56 56H70C76 56 80 60 80 66C80 72 76 76 70 76H56V56Z" fill="hsl(var(--background))" />
        
        {/* Top slant accent */}
        <path d="M40 16L56 16L72 16C72 16 82 16 88 20" stroke="none" fill="none" />
        <path d="M64 10L92 16" stroke="hsl(30, 100%, 45%)" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-black text-foreground leading-tight tracking-tight">Billi</span>
          <span className="text-xs text-muted-foreground font-medium -mt-0.5">bilionaire</span>
        </div>
      )}
    </div>
  );
};

export default BilliLogo;
