import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Target, Crown, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ContributionData {
  date: string;
  amount: number;
  type: string;
  group_name: string;
}

const PremiumAnalytics: React.FC = () => {
  const { t, formatCurrency } = useApp();
  const { user, groups } = useAuthContext();
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      if (!user) return;
      setLoading(true);

      const { data } = await supabase
        .from('contributions')
        .select('amount, type, created_at, group_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) {
        const groupMap = new Map(groups.map(g => [g.id, g.name]));
        setContributions(data.map(c => ({
          date: c.created_at || '',
          amount: c.amount,
          type: c.type,
          group_name: groupMap.get(c.group_id) || 'Unknown',
        })));
      }
      setLoading(false);
    };

    fetchContributions();
  }, [user, groups]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Calculate analytics
  const deposits = contributions.filter(c => c.type === 'deposit');
  const withdrawals = contributions.filter(c => c.type === 'withdrawal');
  const totalDeposited = deposits.reduce((sum, c) => sum + c.amount, 0);
  const totalWithdrawn = withdrawals.reduce((sum, c) => sum + c.amount, 0);
  const netSaved = totalDeposited - totalWithdrawn;

  // Monthly breakdown (last 6 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0, 23, 59, 59);
    const monthDeposits = deposits.filter(c => {
      const d = new Date(c.date);
      return d >= monthDate && d <= monthEnd;
    });
    const monthWithdrawals = withdrawals.filter(c => {
      const d = new Date(c.date);
      return d >= monthDate && d <= monthEnd;
    });
    const deposited = monthDeposits.reduce((sum, c) => sum + c.amount, 0);
    const withdrawn = monthWithdrawals.reduce((sum, c) => sum + c.amount, 0);
    return {
      label: monthDate.toLocaleDateString(undefined, { month: 'short' }),
      deposited,
      withdrawn,
      net: deposited - withdrawn,
    };
  });

  const maxMonthlyAmount = Math.max(...monthlyData.map(m => Math.max(m.deposited, m.withdrawn)), 1);

  // Weekly breakdown (last 4 weeks)
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);

    const weekDeposits = deposits.filter(c => {
      const d = new Date(c.date);
      return d >= weekStart && d < weekEnd;
    });

    return {
      label: `${t('week') || 'Week'} ${4 - i}`,
      amount: weekDeposits.reduce((sum, c) => sum + c.amount, 0),
      count: weekDeposits.length,
    };
  }).reverse();

  const maxWeeklyAmount = Math.max(...weeklyData.map(w => w.amount), 1);

  // Per-group breakdown
  const groupBreakdown = groups.map(g => {
    const groupDeposits = deposits.filter(c => c.group_name === g.name);
    return {
      name: g.name,
      total: groupDeposits.reduce((sum, c) => sum + c.amount, 0),
      count: groupDeposits.length,
      progress: g.goal_amount > 0 ? (g.current_amount / g.goal_amount) * 100 : 0,
    };
  }).sort((a, b) => b.total - a.total);

  // Average contribution
  const avgContribution = deposits.length > 0 ? totalDeposited / deposits.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold">{t('advancedAnalytics') || 'Advanced Analytics'}</h3>
        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1">
          <Crown className="w-3 h-3" /> VIP
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-3 border border-amber-500/20">
          <p className="text-xs text-muted-foreground">{t('totalDeposited') || 'Total Deposited'}</p>
          <p className="text-lg font-bold text-success">{formatCurrency(totalDeposited)}</p>
        </div>
        <div className="glass-card p-3 border border-amber-500/20">
          <p className="text-xs text-muted-foreground">{t('totalWithdrawn') || 'Total Withdrawn'}</p>
          <p className="text-lg font-bold text-destructive">{formatCurrency(totalWithdrawn)}</p>
        </div>
        <div className="glass-card p-3 border border-amber-500/20">
          <p className="text-xs text-muted-foreground">{t('netSaved') || 'Net Saved'}</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(netSaved)}</p>
        </div>
        <div className="glass-card p-3 border border-amber-500/20">
          <p className="text-xs text-muted-foreground">{t('avgContribution') || 'Avg Contribution'}</p>
          <p className="text-lg font-bold text-foreground">{formatCurrency(avgContribution)}</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="glass-card p-4 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-amber-500" />
          <p className="text-sm font-medium">{t('weeklyBreakdown') || 'Weekly Breakdown'}</p>
        </div>
        <div className="flex items-end gap-2 h-24">
          {weeklyData.map((week, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-md"
                initial={{ height: 0 }}
                animate={{ height: `${(week.amount / maxWeeklyAmount) * 80}px` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              />
              <span className="text-[10px] text-muted-foreground">{week.label}</span>
              <span className="text-[10px] font-semibold">{formatCurrency(week.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Group Breakdown */}
      {groupBreakdown.length > 0 && (
        <div className="glass-card p-4 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-medium">{t('perGroupInsights') || 'Per-Group Insights'}</p>
          </div>
          <div className="space-y-3">
            {groupBreakdown.map((group, i) => (
              <motion.div
                key={group.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-1"
              >
                <div className="flex justify-between text-sm">
                  <span className="font-medium truncate flex-1">{group.name}</span>
                  <span className="text-muted-foreground text-xs">{group.count} {t('deposits') || 'deposits'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(group.progress, 100)}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 w-16 text-right">
                    {formatCurrency(group.total)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Indicator */}
      <div className="glass-card p-3 border border-amber-500/20 flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-amber-500" />
        <div>
          <p className="text-sm font-medium">
            {deposits.length > 0
              ? `${t('totalTransactions') || 'Total transactions'}: ${deposits.length} ${t('deposits') || 'deposits'}, ${withdrawals.length} ${t('withdrawals') || 'withdrawals'}`
              : t('startContributing') || 'Start contributing to see your analytics!'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumAnalytics;
