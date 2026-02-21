import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Target, Users, Calendar, Download, Filter,
  Trophy, Clock, Loader2, PieChart, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { format, differenceInDays } from 'date-fns';
import { exportToExcel } from '@/lib/excelExport';

interface GroupData {
  id: string;
  name: string;
  goal_amount: number;
  created_at: string;
  member_count: number;
  total_deposits: number;
  total_withdrawals: number;
  category?: string;
  group_type?: string;
}

interface ContributionData {
  id: string;
  group_id: string;
  user_id: string;
  amount: number;
  type: string;
  created_at: string;
}

interface Props {
  groups: GroupData[];
  contributions: ContributionData[];
  loading: boolean;
}

const CATEGORY_CONFIG: Record<string, { icon: string; label: string }> = {
  travel: { icon: '✈️', label: 'Viagem' },
  real_estate: { icon: '🏠', label: 'Imóveis' },
  investment: { icon: '📈', label: 'Investimento' },
  education: { icon: '🎓', label: 'Educação' },
  credit_card: { icon: '💳', label: 'Cartão de Crédito' },
  other: { icon: '🎁', label: 'Outro' },
};

const AdminAnalyticsTab: React.FC<Props> = ({ groups, contributions, loading }) => {
  const { formatCurrency, t } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterGroupType, setFilterGroupType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, completed, in_progress, pending

  // Enrich groups with category
  const enrichedGroups = useMemo(() => {
    return groups.map(g => {
      const cat = (g as any).category || 'other';
      const netAmount = g.total_deposits - g.total_withdrawals;
      const progress = g.goal_amount > 0 ? (netAmount / g.goal_amount) * 100 : 0;
      const isCompleted = progress >= 100;
      const daysTaken = isCompleted ? null : differenceInDays(new Date(), new Date(g.created_at));
      
      // Find when goal was reached (approximate: last contribution that pushed it over)
      let completionDate: string | null = null;
      if (isCompleted) {
        const groupContribs = contributions
          .filter(c => c.group_id === g.id && c.type === 'deposit')
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        let runningTotal = 0;
        for (const c of groupContribs) {
          runningTotal += Number(c.amount);
          if (runningTotal >= g.goal_amount) {
            completionDate = c.created_at;
            break;
          }
        }
      }

      const daysToComplete = completionDate 
        ? differenceInDays(new Date(completionDate), new Date(g.created_at))
        : null;

      return {
        ...g,
        category: cat,
        group_type: (g as any).group_type || 'shared',
        netAmount,
        progress: Math.min(progress, 100),
        isCompleted,
        daysToComplete,
        completionDate,
      };
    });
  }, [groups, contributions]);

  // Apply filters
  const filteredGroups = useMemo(() => {
    return enrichedGroups.filter(g => {
      if (filterCategory !== 'all' && g.category !== filterCategory) return false;
      if (filterGroupType !== 'all' && g.group_type !== filterGroupType) return false;
      if (filterStatus === 'completed' && !g.isCompleted) return false;
      if (filterStatus === 'in_progress' && (g.isCompleted || g.member_count < 2)) return false;
      if (filterStatus === 'pending' && g.member_count >= 2) return false;
      return true;
    });
  }, [enrichedGroups, filterCategory, filterGroupType, filterStatus]);

  // ===== SEGMENT ANALYTICS =====
  const segmentData = useMemo(() => {
    const segments: Record<string, { 
      count: number; totalAllocated: number; totalGoal: number; 
      completed: number; avgMembers: number; avgDaysToComplete: number[];
      members: number;
    }> = {};

    for (const g of enrichedGroups) {
      const cat = g.category;
      if (!segments[cat]) {
        segments[cat] = { count: 0, totalAllocated: 0, totalGoal: 0, completed: 0, avgMembers: 0, avgDaysToComplete: [], members: 0 };
      }
      segments[cat].count++;
      segments[cat].totalAllocated += Math.max(g.netAmount, 0);
      segments[cat].totalGoal += g.goal_amount;
      segments[cat].members += g.member_count;
      if (g.isCompleted) {
        segments[cat].completed++;
        if (g.daysToComplete !== null) segments[cat].avgDaysToComplete.push(g.daysToComplete);
      }
    }

    return Object.entries(segments).map(([key, val]) => ({
      category: key,
      ...CATEGORY_CONFIG[key] || { icon: '❓', label: key },
      count: val.count,
      totalAllocated: val.totalAllocated,
      totalGoal: val.totalGoal,
      completed: val.completed,
      completionRate: val.count > 0 ? (val.completed / val.count * 100) : 0,
      avgMembers: val.count > 0 ? (val.members / val.count) : 0,
      avgDaysToComplete: val.avgDaysToComplete.length > 0
        ? val.avgDaysToComplete.reduce((s, d) => s + d, 0) / val.avgDaysToComplete.length
        : null,
      members: val.members,
    })).sort((a, b) => b.totalAllocated - a.totalAllocated);
  }, [enrichedGroups]);

  const maxAllocated = Math.max(...segmentData.map(s => s.totalAllocated), 1);

  // ===== COMPLETED GROUPS DETAILS =====
  const completedGroups = useMemo(() => {
    return filteredGroups
      .filter(g => g.isCompleted)
      .sort((a, b) => (a.daysToComplete || 999) - (b.daysToComplete || 999));
  }, [filteredGroups]);

  // ===== GLOBAL STATS =====
  const globalStats = useMemo(() => {
    const total = enrichedGroups.length;
    const completed = enrichedGroups.filter(g => g.isCompleted).length;
    const totalAllocated = enrichedGroups.reduce((s, g) => s + Math.max(g.netAmount, 0), 0);
    const totalGoal = enrichedGroups.reduce((s, g) => s + g.goal_amount, 0);
    const avgProgress = total > 0 ? enrichedGroups.reduce((s, g) => s + g.progress, 0) / total : 0;
    const avgMembers = total > 0 ? enrichedGroups.reduce((s, g) => s + g.member_count, 0) / total : 0;
    const completionTimes = enrichedGroups.filter(g => g.daysToComplete !== null).map(g => g.daysToComplete!);
    const avgCompletionDays = completionTimes.length > 0 
      ? completionTimes.reduce((s, d) => s + d, 0) / completionTimes.length 
      : 0;

    return { total, completed, totalAllocated, totalGoal, avgProgress, avgMembers, avgCompletionDays };
  }, [enrichedGroups]);

  // ===== EXPORTS =====
  const exportSegments = () => {
    const rows = segmentData.map(s => ({
      'Segmento': `${s.icon} ${s.label}`,
      'Grupos': s.count,
      'Valor Alocado': s.totalAllocated,
      'Meta Total': s.totalGoal,
      'Concluídos': s.completed,
      'Taxa Conclusão %': s.completionRate.toFixed(1),
      'Membros Total': s.members,
      'Média Membros': s.avgMembers.toFixed(1),
      'Dias Médio Conclusão': s.avgDaysToComplete?.toFixed(0) || 'N/A',
    }));
    exportToExcel([{ sheetName: 'Segmentos', rows }], 'billi-segmentos');
  };

  const exportCompletedGroups = () => {
    const rows = completedGroups.map(g => ({
      'Grupo': g.name,
      'Segmento': CATEGORY_CONFIG[g.category]?.label || g.category,
      'Tipo': g.group_type === 'individual' ? 'Individual' : 'Compartilhado',
      'Meta': g.goal_amount,
      'Valor Final': g.netAmount,
      'Membros': g.member_count,
      'Dias para Concluir': g.daysToComplete || 'N/A',
      'Data Criação': g.created_at ? format(new Date(g.created_at), 'dd/MM/yyyy') : '',
      'Data Conclusão': g.completionDate ? format(new Date(g.completionDate), 'dd/MM/yyyy') : '',
    }));
    exportToExcel([{ sheetName: 'Grupos Concluídos', rows }], 'billi-grupos-concluidos');
  };

  const exportFullAnalytics = () => {
    const segRows = segmentData.map(s => ({
      'Segmento': `${s.icon} ${s.label}`,
      'Grupos': s.count, 'Valor Alocado': s.totalAllocated, 'Meta Total': s.totalGoal,
      'Concluídos': s.completed, 'Taxa %': s.completionRate.toFixed(1),
      'Membros': s.members, 'Média Membros': s.avgMembers.toFixed(1),
      'Dias Médio': s.avgDaysToComplete?.toFixed(0) || 'N/A',
    }));
    const compRows = completedGroups.map(g => ({
      'Grupo': g.name, 'Segmento': CATEGORY_CONFIG[g.category]?.label || g.category,
      'Meta': g.goal_amount, 'Membros': g.member_count,
      'Dias': g.daysToComplete || 'N/A',
    }));
    const allGroupRows = filteredGroups.map(g => ({
      'Grupo': g.name, 'Segmento': CATEGORY_CONFIG[g.category]?.label || g.category,
      'Tipo': g.group_type, 'Meta': g.goal_amount, 'Alocado': g.netAmount,
      'Progresso %': g.progress.toFixed(1), 'Membros': g.member_count,
      'Status': g.isCompleted ? 'Concluído' : g.member_count < 2 ? 'Pendente' : 'Em andamento',
      'Criação': g.created_at ? format(new Date(g.created_at), 'dd/MM/yyyy') : '',
    }));
    exportToExcel([
      { sheetName: 'Segmentos', rows: segRows },
      { sheetName: 'Grupos Concluídos', rows: compRows },
      { sheetName: 'Todos os Grupos', rows: allGroupRows },
    ], 'billi-analytics-completo');
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Export & Filters */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={exportFullAnalytics} className="h-7 text-[10px]">
          <Download className="w-3 h-3 mr-1" />Excel Completo
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-8 text-xs flex-1 min-w-[100px]">
            <Layers className="w-3 h-3 mr-1" /><SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Segmentos</SelectItem>
            {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterGroupType} onValueChange={setFilterGroupType}>
          <SelectTrigger className="h-8 text-xs flex-1 min-w-[100px]">
            <Filter className="w-3 h-3 mr-1" /><SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Tipos</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="shared">Compartilhado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 text-xs flex-1 min-w-[100px]">
            <Target className="w-3 h-3 mr-1" /><SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="completed">✅ Concluídos</SelectItem>
            <SelectItem value="in_progress">🔄 Em andamento</SelectItem>
            <SelectItem value="pending">⏳ Pendentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Global Summary */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Target, label: 'Grupos', value: globalStats.total },
          { icon: Trophy, label: 'Concluídos', value: globalStats.completed },
          { icon: TrendingUp, label: 'Alocado', value: formatCurrency(globalStats.totalAllocated) },
          { icon: Clock, label: 'Dias Médio', value: globalStats.avgCompletionDays > 0 ? `${globalStats.avgCompletionDays.toFixed(0)}d` : '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass-card p-2 text-center">
            <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-sm font-bold truncate">{value}</p>
            <p className="text-[9px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card p-2 text-center">
          <p className="text-sm font-bold">{globalStats.avgProgress.toFixed(1)}%</p>
          <p className="text-[9px] text-muted-foreground">Progresso Médio</p>
        </div>
        <div className="glass-card p-2 text-center">
          <p className="text-sm font-bold">{globalStats.avgMembers.toFixed(1)}</p>
          <p className="text-[9px] text-muted-foreground">Média Membros</p>
        </div>
        <div className="glass-card p-2 text-center">
          <p className="text-sm font-bold">{formatCurrency(globalStats.totalGoal)}</p>
          <p className="text-[9px] text-muted-foreground">Meta Total</p>
        </div>
      </div>

      {/* ===== SEGMENT BREAKDOWN ===== */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Valor Alocado por Segmento</p>
          </div>
          <Button variant="ghost" size="sm" onClick={exportSegments} className="h-6 text-[10px]">
            <Download className="w-3 h-3 mr-1" />Excel
          </Button>
        </div>
        
        {segmentData.map((seg, i) => (
          <motion.div
            key={seg.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{seg.icon}</span>
                <div>
                  <span className="text-sm font-medium">{seg.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">
                    {seg.count} grupos • {seg.members} membros
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-primary">{formatCurrency(seg.totalAllocated)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(seg.totalAllocated / maxAllocated) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="bg-muted/30 rounded p-1">
                <p className="text-[10px] font-bold">{seg.completed}/{seg.count}</p>
                <p className="text-[8px] text-muted-foreground">Concluídos</p>
              </div>
              <div className="bg-muted/30 rounded p-1">
                <p className="text-[10px] font-bold">{seg.completionRate.toFixed(0)}%</p>
                <p className="text-[8px] text-muted-foreground">Taxa</p>
              </div>
              <div className="bg-muted/30 rounded p-1">
                <p className="text-[10px] font-bold">{seg.avgDaysToComplete ? `${seg.avgDaysToComplete.toFixed(0)}d` : '—'}</p>
                <p className="text-[8px] text-muted-foreground">Dias Médio</p>
              </div>
            </div>
          </motion.div>
        ))}

        {segmentData.length === 0 && (
          <p className="text-center py-4 text-muted-foreground text-xs">Nenhum dado disponível</p>
        )}
      </div>

      {/* ===== COMPLETED GROUPS TABLE ===== */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Grupos que Atingiram a Meta ({completedGroups.length})</p>
          </div>
          <Button variant="ghost" size="sm" onClick={exportCompletedGroups} className="h-6 text-[10px]">
            <Download className="w-3 h-3 mr-1" />Excel
          </Button>
        </div>

        {completedGroups.length > 0 ? (
          <div className="space-y-2">
            {completedGroups.map((g, i) => {
              const catConfig = CATEGORY_CONFIG[g.category] || { icon: '❓', label: g.category };
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-muted/30 rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span>{catConfig.icon}</span>
                      <span className="text-sm font-semibold truncate">{g.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 font-medium shrink-0">
                      ✅ Concluído
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                    <div>
                      <p className="font-bold">{formatCurrency(g.goal_amount)}</p>
                      <p className="text-muted-foreground">Meta</p>
                    </div>
                    <div>
                      <p className="font-bold">{g.member_count}</p>
                      <p className="text-muted-foreground">Membros</p>
                    </div>
                    <div>
                      <p className="font-bold">{g.daysToComplete !== null ? `${g.daysToComplete}d` : '—'}</p>
                      <p className="text-muted-foreground">Tempo</p>
                    </div>
                    <div>
                      <p className="font-bold">{g.completionDate ? format(new Date(g.completionDate), 'dd/MM/yy') : '—'}</p>
                      <p className="text-muted-foreground">Conclusão</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground text-xs">Nenhum grupo concluiu a meta ainda</p>
        )}
      </div>

      {/* ===== ALL GROUPS PROGRESS ===== */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Progresso de Todos os Grupos ({filteredGroups.length})</p>
        </div>
        <div className="space-y-2">
          {filteredGroups.slice(0, 30).map((g, i) => {
            const catConfig = CATEGORY_CONFIG[g.category] || { icon: '❓', label: g.category };
            return (
              <div key={g.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-sm">{catConfig.icon}</span>
                    <span className="font-medium truncate">{g.name}</span>
                    <span className="text-[9px] text-muted-foreground shrink-0">
                      {g.member_count}👥
                    </span>
                  </div>
                  <span className="text-[10px] font-bold shrink-0 ml-2">
                    {g.progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={g.progress} className="h-1.5" />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>{formatCurrency(g.netAmount)} / {formatCurrency(g.goal_amount)}</span>
                  <span>{g.isCompleted ? '✅' : g.group_type === 'individual' ? '👤' : '👥'} {catConfig.label}</span>
                </div>
              </div>
            );
          })}
          {filteredGroups.length === 0 && (
            <p className="text-center py-4 text-muted-foreground text-xs">Nenhum grupo encontrado com esses filtros</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsTab;
