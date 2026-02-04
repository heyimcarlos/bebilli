import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Award } from 'lucide-react';
import { badges, tierColors, Badge } from '@/lib/localization';
import { useApp } from '@/contexts/AppContext';

interface ProfileBadgesProps {
  streak: number;
  totalContributions: number;
  totalAmount: number;
  groupsCount: number;
  level: number;
}

const ProfileBadges: React.FC<ProfileBadgesProps> = ({
  streak,
  totalContributions,
  totalAmount,
  groupsCount,
  level,
}) => {
  const { language, t } = useApp();

  const checkBadgeUnlocked = (badge: Badge): boolean => {
    switch (badge.requirement.type) {
      case 'streak':
        return streak >= badge.requirement.value;
      case 'contributions':
        return totalContributions >= badge.requirement.value;
      case 'amount':
        return totalAmount >= badge.requirement.value;
      case 'groups':
        return groupsCount >= badge.requirement.value;
      case 'level':
        return level >= badge.requirement.value;
      default:
        return false;
    }
  };

  const getProgress = (badge: Badge): number => {
    let current = 0;
    switch (badge.requirement.type) {
      case 'streak':
        current = streak;
        break;
      case 'contributions':
        current = totalContributions;
        break;
      case 'amount':
        current = totalAmount;
        break;
      case 'groups':
        current = groupsCount;
        break;
      case 'level':
        current = level;
        break;
    }
    return Math.min(100, (current / badge.requirement.value) * 100);
  };

  const unlockedBadges = badges.filter(checkBadgeUnlocked);
  const lockedBadges = badges.filter(b => !checkBadgeUnlocked(b));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">{t('achievements') || 'Achievements'}</h3>
        <span className="text-sm text-muted-foreground">
          ({unlockedBadges.length}/{badges.length})
        </span>
      </div>

      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {unlockedBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
              className={`glass-card p-3 text-center border ${tierColors[badge.tier].border}`}
            >
              <div className={`text-3xl mb-1 ${tierColors[badge.tier].text}`}>
                {badge.icon}
              </div>
              <p className="text-xs font-medium truncate">
                {badge.name[language] || badge.name.en}
              </p>
              <div className={`text-[10px] ${tierColors[badge.tier].text} capitalize`}>
                {badge.tier}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t('nextBadges') || 'Next badges'}</p>
          <div className="grid grid-cols-1 gap-2">
            {lockedBadges.slice(0, 3).map((badge) => {
              const progress = getProgress(badge);
              return (
                <div
                  key={badge.id}
                  className="glass-card p-3 flex items-center gap-3 opacity-60"
                >
                  <div className="relative">
                    <div className="text-2xl grayscale">{badge.icon}</div>
                    <Lock className="w-3 h-3 absolute -bottom-1 -right-1 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {badge.name[language] || badge.name.en}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {badge.description[language] || badge.description.en}
                    </p>
                    <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary/50 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(progress)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBadges;
