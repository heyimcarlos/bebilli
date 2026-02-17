import React from 'react';

interface DefaultAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

// Generate a deterministic avatar variation based on name
const getAvatarStyle = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variant = hash % 10;
  
  const hairStyles = [
    { hair: 'short-spiky', color: '#3D2B1F' },
    { hair: 'long-straight', color: '#8B4513' },
    { hair: 'curly', color: '#2C1608' },
    { hair: 'bob', color: '#D4A574' },
    { hair: 'mohawk', color: '#1A1A1A' },
    { hair: 'ponytail', color: '#654321' },
    { hair: 'buzz', color: '#4A3728' },
    { hair: 'side-part', color: '#2C1608' },
    { hair: 'afro', color: '#1A1A1A' },
    { hair: 'bun', color: '#8B4513' },
  ];

  const skinTones = ['#FDDCB5', '#E8B896', '#D4956B', '#C68642', '#8D5524', '#F5D0A9', '#DEB887', '#CD853F'];
  
  const shirtColors = ['#E8751A', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#06B6D4', '#EC4899'];

  return {
    ...hairStyles[variant],
    skin: skinTones[hash % skinTones.length],
    shirt: shirtColors[(hash * 7) % shirtColors.length],
    hasGlasses: hash % 4 === 0,
    hasBow: hash % 5 === 0 && hash % 2 !== 0,
    hasEarring: hash % 7 === 0,
    eyeShape: hash % 3, // 0=round, 1=wide, 2=narrow
    mouthShape: hash % 4, // 0=smile, 1=grin, 2=small, 3=open
  };
};

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ name, size = 40, className = '' }) => {
  const style = getAvatarStyle(name);
  const noseColor = ['#FDDCB5', '#F5D0A9', '#DEB887'].includes(style.skin) ? '#D4956B' : '#8D5524';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orange circle border */}
      <circle cx="40" cy="40" r="38" fill="#E8751A" stroke="#D4680F" strokeWidth="2" />
      <circle cx="40" cy="40" r="34" fill="#FFF8F0" />
      
      {/* Face */}
      <circle cx="40" cy="36" r="17" fill={style.skin} />
      
      {/* Eyes */}
      {style.eyeShape === 0 && (
        <>
          <circle cx="34" cy="34" r="2.5" fill="#1A1A1A" />
          <circle cx="46" cy="34" r="2.5" fill="#1A1A1A" />
        </>
      )}
      {style.eyeShape === 1 && (
        <>
          <ellipse cx="34" cy="34" rx="3" ry="2.5" fill="#1A1A1A" />
          <ellipse cx="46" cy="34" rx="3" ry="2.5" fill="#1A1A1A" />
        </>
      )}
      {style.eyeShape === 2 && (
        <>
          <ellipse cx="34" cy="34" rx="2" ry="3" fill="#1A1A1A" />
          <ellipse cx="46" cy="34" rx="2" ry="3" fill="#1A1A1A" />
        </>
      )}
      
      {/* Eye highlights */}
      <circle cx="35" cy="33" r="1" fill="white" />
      <circle cx="47" cy="33" r="1" fill="white" />

      {/* Eyebrows */}
      <path d="M31 30 Q34 28 37 30" fill="none" stroke={style.color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M43 30 Q46 28 49 30" fill="none" stroke={style.color} strokeWidth="1.2" strokeLinecap="round" />
      
      {/* Nose */}
      <path d="M40 36 L38.5 39.5 L41.5 39.5" fill="none" stroke={noseColor} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Mouth variations */}
      {style.mouthShape === 0 && (
        <path d="M35 43 Q40 47 45 43" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {style.mouthShape === 1 && (
        <path d="M34 42 Q40 48 46 42" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {style.mouthShape === 2 && (
        <path d="M37 43 Q40 45 43 43" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {style.mouthShape === 3 && (
        <ellipse cx="40" cy="44" rx="3" ry="2.5" fill="#1A1A1A" />
      )}
      
      {/* Cheek blush */}
      <circle cx="28" cy="40" r="3" fill="#FFB5B5" opacity="0.35" />
      <circle cx="52" cy="40" r="3" fill="#FFB5B5" opacity="0.35" />

      {/* Hair styles */}
      {style.hair === 'short-spiky' && (
        <path d="M23 30 C23 16 32 12 40 12 C48 12 57 16 57 30 L55 26 L51 24 L47 27 L43 22 L40 25 L37 22 L33 27 L29 24 L25 26 Z" fill={style.color} />
      )}
      {style.hair === 'long-straight' && (
        <path d="M22 34 C22 16 30 10 40 10 C50 10 58 16 58 34 L58 46 C58 46 55 38 55 32 L25 32 C25 38 22 46 22 46 Z" fill={style.color} />
      )}
      {style.hair === 'curly' && (
        <>
          <circle cx="28" cy="22" r="6" fill={style.color} />
          <circle cx="40" cy="18" r="7" fill={style.color} />
          <circle cx="52" cy="22" r="6" fill={style.color} />
          <circle cx="34" cy="16" r="5" fill={style.color} />
          <circle cx="46" cy="16" r="5" fill={style.color} />
        </>
      )}
      {style.hair === 'bob' && (
        <path d="M20 32 C20 14 30 10 40 10 C50 10 60 14 60 32 C60 40 56 42 54 42 L54 28 L26 28 L26 42 C24 42 20 40 20 32 Z" fill={style.color} />
      )}
      {style.hair === 'mohawk' && (
        <path d="M35 14 C35 8 37 4 40 4 C43 4 45 8 45 14 L45 26 L35 26 Z" fill={style.color} />
      )}
      {style.hair === 'ponytail' && (
        <>
          <path d="M22 30 C22 16 30 10 40 10 C50 10 58 16 58 30 L54 26 L26 26 Z" fill={style.color} />
          <path d="M54 22 C58 22 62 26 62 34 C62 40 60 46 58 48" stroke={style.color} strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      )}
      {style.hair === 'buzz' && (
        <path d="M24 30 C24 16 32 12 40 12 C48 12 56 16 56 30 L54 28 L26 28 Z" fill={style.color} />
      )}
      {style.hair === 'side-part' && (
        <>
          <path d="M22 30 C22 14 30 10 40 10 C50 10 58 14 58 30 L54 26 L26 26 Z" fill={style.color} />
          <path d="M28 20 C28 14 34 10 40 10" stroke={style.color} strokeWidth="3" fill="none" />
        </>
      )}
      {style.hair === 'afro' && (
        <circle cx="40" cy="24" r="20" fill={style.color} />
      )}
      {style.hair === 'bun' && (
        <>
          <path d="M22 30 C22 16 30 10 40 10 C50 10 58 16 58 30 L54 26 L26 26 Z" fill={style.color} />
          <circle cx="40" cy="8" r="7" fill={style.color} />
        </>
      )}
      
      {/* Glasses */}
      {style.hasGlasses && (
        <>
          <circle cx="34" cy="34" r="5.5" fill="none" stroke="#333" strokeWidth="1.5" />
          <circle cx="46" cy="34" r="5.5" fill="none" stroke="#333" strokeWidth="1.5" />
          <path d="M39.5 34 L40.5 34" stroke="#333" strokeWidth="1.5" />
          <path d="M28.5 33 L24 31" stroke="#333" strokeWidth="1.5" />
          <path d="M51.5 33 L56 31" stroke="#333" strokeWidth="1.5" />
        </>
      )}

      {/* Hair bow accessory */}
      {style.hasBow && (
        <>
          <circle cx="54" cy="18" r="2" fill="#EF4444" />
          <path d="M50 16 L54 18 L50 20" fill="#EF4444" stroke="#C53030" strokeWidth="0.5" />
          <path d="M58 16 L54 18 L58 20" fill="#EF4444" stroke="#C53030" strokeWidth="0.5" />
        </>
      )}

      {/* Earring */}
      {style.hasEarring && (
        <circle cx="22" cy="38" r="1.5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
      )}
      
      {/* Body/shirt */}
      <path d="M24 56 C24 50 32 48 40 48 C48 48 56 50 56 56 L56 66 C56 68 54 70 52 70 L28 70 C26 70 24 68 24 66 Z" fill={style.shirt} />
      
      {/* Shirt collar detail */}
      <path d="M36 48 L40 52 L44 48" fill="none" stroke="white" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
};

export default DefaultAvatar;
