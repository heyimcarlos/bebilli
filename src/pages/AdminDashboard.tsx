import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Target, Key, Copy, RefreshCw, Loader2, Search, 
  TrendingUp, Crown, Shield, UserCog, Ticket, Mail, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, DollarSign, Calendar, Filter, BarChart3, Eye,
  Activity, Globe, Coins, CreditCard, Receipt
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';

// ===== Types =====
interface UserFull {
  id: string;
  name: string;
  avatar_url: string | null;
  is_premium: boolean;
  level: number;
  total_contributions: number;
  created_at: string;
  country: string | null;
  city: string | null;
  phone: string | null;
  language: string | null;
  currency: string | null;
  current_streak: number;
  best_streak: number;
  consistency_days: number;
  max_saved: number;
  last_contribution_at: string | null;
  role?: string;
  groups?: UserGroupInfo[];
  communities?: string[];
}

interface UserGroupInfo {
  group_id: string;
  group_name: string;
  role: string;
  total_deposited: number;
  total_withdrawn: number;
}

interface GroupFull {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  goal_amount: number;
  invite_code: string;
  created_at: string;
  member_count: number;
  total_deposits: number;
  total_withdrawals: number;
  members: GroupMemberInfo[];
}

interface GroupMemberInfo {
  user_id: string;
  user_name: string;
  role: string;
  deposited: number;
  withdrawn: number;
}

interface CouponData {
  id: string;
  code: string;
  description: string | null;
  discount_percentage: number | null;
  discount_amount: number | null;
  is_active: boolean;
  current_uses: number;
  max_uses: number | null;
  valid_from: string;
  valid_until: string | null;
}

interface CouponUsageInfo {
  id: string;
  coupon_code: string;
  user_name: string;
  user_id: string;
  used_at: string;
}

// ===== Component =====
const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { toast } = useToast();
  const { formatCurrency } = useApp();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  
  // Users state
  const [users, setUsers] = useState<UserFull[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  
  // Groups state
  const [groups, setGroups] = useState<GroupFull[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [regeneratingCode, setRegeneratingCode] = useState<string | null>(null);
  
  // Coupons state
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponUsages, setCouponUsages] = useState<CouponUsageInfo[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', description: '', discount_percentage: '', max_uses: '', valid_until: '' });

  // Contributions raw data for financial tab
  const [allContributions, setAllContributions] = useState<any[]>([]);
  
  // Filters
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');

  // Check admin authorization
  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAuthorized(false); return; }
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAuthorized(!!roleData);
    };
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchAll();
    }
  }, [isAuthorized]);

  const fetchAll = () => {
    fetchUsers();
    fetchGroups();
    fetchCoupons();
    fetchContributions();
    fetchCouponUsages();
  };

  // ===== FETCH USERS =====
  const fetchUsers = async () => {
    setUsersLoading(true);
    const [profilesRes, rolesRes, membershipsRes, communityMembersRes, contributionsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('group_memberships').select('user_id, group_id, role'),
      supabase.from('community_members').select('user_id, community_id'),
      supabase.from('contributions').select('user_id, group_id, amount, type'),
    ]);

    // Get group names
    const groupIds = [...new Set((membershipsRes.data || []).map(m => m.group_id))];
    const { data: groupsData } = groupIds.length > 0 
      ? await supabase.from('groups').select('id, name').in('id', groupIds)
      : { data: [] };
    const groupNameMap = new Map((groupsData || []).map(g => [g.id, g.name]));

    // Get community names
    const communityIds = [...new Set((communityMembersRes.data || []).map(m => m.community_id))];
    const { data: communitiesData } = communityIds.length > 0
      ? await supabase.from('communities').select('id, name').in('id', communityIds)
      : { data: [] };
    const communityNameMap = new Map((communitiesData || []).map(c => [c.id, c.name]));

    const roleMap = new Map<string, string>();
    (rolesRes.data || []).forEach(r => roleMap.set(r.user_id, r.role));

    const usersResult: UserFull[] = (profilesRes.data || []).map(p => {
      // User memberships
      const userMemberships = (membershipsRes.data || []).filter(m => m.user_id === p.id);
      const userContributions = (contributionsRes.data || []).filter(c => c.user_id === p.id);
      const userCommunities = (communityMembersRes.data || []).filter(cm => cm.user_id === p.id);

      const groupsInfo: UserGroupInfo[] = userMemberships.map(m => {
        const groupContribs = userContributions.filter(c => c.group_id === m.group_id);
        const deposited = groupContribs.filter(c => c.type === 'deposit').reduce((s, c) => s + Number(c.amount), 0);
        const withdrawn = groupContribs.filter(c => c.type === 'withdrawal').reduce((s, c) => s + Number(c.amount), 0);
        return {
          group_id: m.group_id,
          group_name: groupNameMap.get(m.group_id) || 'Desconhecido',
          role: m.role,
          total_deposited: deposited,
          total_withdrawn: withdrawn,
        };
      });

      return {
        id: p.id,
        name: p.name,
        avatar_url: p.avatar_url,
        is_premium: p.is_premium || false,
        level: p.level || 1,
        total_contributions: p.total_contributions || 0,
        created_at: p.created_at || '',
        country: p.country,
        city: p.city,
        phone: p.phone,
        language: p.language,
        currency: p.currency,
        current_streak: p.current_streak || 0,
        best_streak: p.best_streak || 0,
        consistency_days: p.consistency_days || 0,
        max_saved: p.max_saved || 0,
        last_contribution_at: p.last_contribution_at,
        role: roleMap.get(p.id) || 'user',
        groups: groupsInfo,
        communities: userCommunities.map(cm => communityNameMap.get(cm.community_id) || 'Desconhecida'),
      };
    });

    setUsers(usersResult);
    setUsersLoading(false);
  };

  // ===== FETCH GROUPS =====
  const fetchGroups = async () => {
    setGroupsLoading(true);
    const [groupsRes, membershipsRes, contributionsRes] = await Promise.all([
      supabase.from('groups').select('id, name, description, image_url, goal_amount, invite_code, created_at').order('created_at', { ascending: false }),
      supabase.from('group_memberships').select('group_id, user_id, role'),
      supabase.from('contributions').select('group_id, user_id, amount, type'),
    ]);

    // Get profile names for members
    const allUserIds = [...new Set((membershipsRes.data || []).map(m => m.user_id))];
    const { data: profilesData } = allUserIds.length > 0
      ? await supabase.from('profiles').select('id, name').in('id', allUserIds)
      : { data: [] };
    const nameMap = new Map((profilesData || []).map(p => [p.id, p.name]));

    const result: GroupFull[] = (groupsRes.data || []).map(g => {
      const gMembers = (membershipsRes.data || []).filter(m => m.group_id === g.id);
      const gContribs = (contributionsRes.data || []).filter(c => c.group_id === g.id);
      const totalDeposits = gContribs.filter(c => c.type === 'deposit').reduce((s, c) => s + Number(c.amount), 0);
      const totalWithdrawals = gContribs.filter(c => c.type === 'withdrawal').reduce((s, c) => s + Number(c.amount), 0);

      const members: GroupMemberInfo[] = gMembers.map(m => {
        const mContribs = gContribs.filter(c => c.user_id === m.user_id);
        return {
          user_id: m.user_id,
          user_name: nameMap.get(m.user_id) || 'Desconhecido',
          role: m.role,
          deposited: mContribs.filter(c => c.type === 'deposit').reduce((s, c) => s + Number(c.amount), 0),
          withdrawn: mContribs.filter(c => c.type === 'withdrawal').reduce((s, c) => s + Number(c.amount), 0),
        };
      });

      return { ...g, member_count: gMembers.length, total_deposits: totalDeposits, total_withdrawals: totalWithdrawals, members };
    });

    setGroups(result);
    setGroupsLoading(false);
  };

  // ===== FETCH CONTRIBUTIONS =====
  const fetchContributions = async () => {
    const { data } = await supabase.from('contributions').select('*').order('created_at', { ascending: false });
    setAllContributions(data || []);
  };

  // ===== FETCH COUPONS =====
  const fetchCoupons = async () => {
    setCouponsLoading(true);
    const { data } = await supabase.from('subscription_coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setCouponsLoading(false);
  };

  const fetchCouponUsages = async () => {
    const { data: usages } = await supabase.from('coupon_usages').select('*').order('used_at', { ascending: false });
    if (!usages || usages.length === 0) { setCouponUsages([]); return; }

    const couponIds = [...new Set(usages.map(u => u.coupon_id))];
    const userIds = [...new Set(usages.map(u => u.user_id))];

    const [couponsRes, profilesRes] = await Promise.all([
      supabase.from('subscription_coupons').select('id, code').in('id', couponIds),
      supabase.from('profiles').select('id, name').in('id', userIds),
    ]);

    const couponCodeMap = new Map((couponsRes.data || []).map(c => [c.id, c.code]));
    const nameMap = new Map((profilesRes.data || []).map(p => [p.id, p.name]));

    setCouponUsages(usages.map(u => ({
      id: u.id,
      coupon_code: couponCodeMap.get(u.coupon_id) || '???',
      user_name: nameMap.get(u.user_id) || 'Desconhecido',
      user_id: u.user_id,
      used_at: u.used_at,
    })));
  };

  // ===== ACTIONS =====
  const togglePremium = async (userId: string, current: boolean) => {
    await supabase.from('profiles').update({ is_premium: !current }).eq('id', userId);
    toast({ title: current ? 'Premium desativado' : 'Premium ativado!' });
    fetchUsers();
  };

  const toggleAdmin = async (userId: string, currentRole: string) => {
    if (currentRole === 'admin') {
      await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
      toast({ title: 'Admin removido' });
    } else {
      await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' as any });
      toast({ title: 'Admin adicionado!' });
    }
    fetchUsers();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Código copiado!', description: code });
  };

  const handleRegenerateCode = async (groupId: string) => {
    setRegeneratingCode(groupId);
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await supabase.from('groups').update({ invite_code: newCode }).eq('id', groupId);
    toast({ title: 'Código regenerado!', description: newCode });
    fetchGroups();
    setRegeneratingCode(null);
  };

  const createCoupon = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('subscription_coupons').insert({
      code: couponForm.code.toUpperCase(),
      description: couponForm.description,
      discount_percentage: couponForm.discount_percentage ? parseInt(couponForm.discount_percentage) : null,
      max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
      valid_until: couponForm.valid_until || null,
      created_by: user?.id,
    });
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); }
    else {
      toast({ title: 'Cupom criado!' });
      setCouponForm({ code: '', description: '', discount_percentage: '', max_uses: '', valid_until: '' });
      setShowCouponForm(false);
      fetchCoupons();
    }
  };

  const toggleCoupon = async (couponId: string, isActive: boolean) => {
    await supabase.from('subscription_coupons').update({ is_active: !isActive }).eq('id', couponId);
    toast({ title: isActive ? 'Cupom desativado' : 'Cupom ativado!' });
    fetchCoupons();
  };

  // ===== COMPUTED =====
  const availableCountries = useMemo(() => [...new Set(users.map(u => u.country).filter(Boolean))].sort(), [users]);
  const availableCurrencies = useMemo(() => [...new Set(users.map(u => u.currency).filter(Boolean))].sort(), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.role?.toLowerCase().includes(userSearch.toLowerCase());
      const matchesCountry = filterCountry === 'all' || u.country === filterCountry;
      const matchesCurrency = filterCurrency === 'all' || u.currency === filterCurrency;
      return matchesSearch && matchesCountry && matchesCurrency;
    });
  }, [users, userSearch, filterCountry, filterCurrency]);

  const filteredGroups = useMemo(() => groups.filter(g =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase()) || g.invite_code.toLowerCase().includes(groupSearch.toLowerCase())
  ), [groups, groupSearch]);

  // Financial aggregates
  const financialStats = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const monthStart = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
    const yearStart = format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd');

    const deposits = allContributions.filter(c => c.type === 'deposit');
    const todayDeposits = deposits.filter(c => c.created_at?.startsWith(todayStr)).reduce((s: number, c: any) => s + Number(c.amount), 0);
    const monthDeposits = deposits.filter(c => c.created_at >= monthStart).reduce((s: number, c: any) => s + Number(c.amount), 0);
    const yearDeposits = deposits.filter(c => c.created_at >= yearStart).reduce((s: number, c: any) => s + Number(c.amount), 0);
    const totalDeposits = deposits.reduce((s: number, c: any) => s + Number(c.amount), 0);

    return { todayDeposits, monthDeposits, yearDeposits, totalDeposits };
  }, [allContributions]);

  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.is_premium).length;
  const totalGroupsCount = groups.length;
  const totalGroupNet = groups.reduce((sum, g) => sum + g.total_deposits - g.total_withdrawals, 0);

  // Days since registration
  const daysSince = (dateStr: string) => {
    if (!dateStr) return 0;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isAuthorized === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-2">Acesso negado</h1>
        <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta página.</p>
        <Button onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Gestão completa da plataforma</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Users, label: 'Usuários', value: totalUsers },
            { icon: Crown, label: 'Premium', value: premiumUsers },
            { icon: Target, label: 'Grupos', value: totalGroupsCount },
            { icon: TrendingUp, label: 'Líquido', value: formatCurrency(totalGroupNet) },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={label} className="glass-card p-2 text-center">
              <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-sm font-bold truncate">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Global Filters */}
      <div className="px-4 mb-4 flex gap-2">
        <Select value={filterCountry} onValueChange={setFilterCountry}>
          <SelectTrigger className="h-8 text-xs flex-1">
            <Globe className="w-3 h-3 mr-1" /><SelectValue placeholder="País" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os países</SelectItem>
            {availableCountries.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCurrency} onValueChange={setFilterCurrency}>
          <SelectTrigger className="h-8 text-xs flex-1">
            <Coins className="w-3 h-3 mr-1" /><SelectValue placeholder="Moeda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as moedas</SelectItem>
            {availableCurrencies.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 h-9">
            <TabsTrigger value="users" className="text-[10px] px-1"><UserCog className="w-3 h-3 mr-0.5" />Usuários</TabsTrigger>
            <TabsTrigger value="groups" className="text-[10px] px-1"><Target className="w-3 h-3 mr-0.5" />Grupos</TabsTrigger>
            <TabsTrigger value="financial" className="text-[10px] px-1"><BarChart3 className="w-3 h-3 mr-0.5" />Financeiro</TabsTrigger>
            <TabsTrigger value="coupons" className="text-[10px] px-1"><Ticket className="w-3 h-3 mr-0.5" />Cupons</TabsTrigger>
          </TabsList>

          {/* ==================== USERS TAB ==================== */}
          <TabsContent value="users" className="space-y-3 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-10 h-9" />
            </div>
            <p className="text-xs text-muted-foreground">{filteredUsers.length} usuário(s)</p>

            {usersLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="glass-card p-3 space-y-2">
                    {/* Header row */}
                    <div className="flex items-center gap-2" onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)} role="button">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">
                        {u.avatar_url ? <img src={u.avatar_url} className="w-8 h-8 rounded-full object-cover" /> : u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-semibold text-sm truncate">{u.name}</span>
                          {u.role === 'admin' && <span className="text-[9px] px-1 py-0.5 rounded bg-destructive/20 text-destructive font-medium">ADMIN</span>}
                          {u.is_premium && <span className="text-[9px] px-1 py-0.5 rounded bg-accent/20 text-accent font-medium">VIP</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Nv{u.level} • {u.consistency_days}d ativo • {u.country || '—'} • {u.currency || '—'}
                        </p>
                      </div>
                      {expandedUser === u.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>

                    {/* Expanded details */}
                    {expandedUser === u.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 pt-2 border-t border-border">
                        {/* Profile details */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Cidade:</span> {u.city || '—'}</div>
                          <div><span className="text-muted-foreground">Telefone:</span> {u.phone || '—'}</div>
                          <div><span className="text-muted-foreground">Idioma:</span> {u.language || '—'}</div>
                          <div><span className="text-muted-foreground">Moeda:</span> {u.currency || '—'}</div>
                          <div><span className="text-muted-foreground">Streak atual:</span> {u.current_streak}d</div>
                          <div><span className="text-muted-foreground">Melhor streak:</span> {u.best_streak}d</div>
                          <div><span className="text-muted-foreground">Máx economizado:</span> {formatCurrency(u.max_saved)}</div>
                          <div><span className="text-muted-foreground">Total depósitos:</span> {u.total_contributions}</div>
                          <div><span className="text-muted-foreground">Cadastro:</span> {u.created_at ? format(new Date(u.created_at), 'dd/MM/yyyy') : '—'}</div>
                          <div><span className="text-muted-foreground">Dias no app:</span> {daysSince(u.created_at)}</div>
                          <div><span className="text-muted-foreground">Última contrib.:</span> {u.last_contribution_at ? format(new Date(u.last_contribution_at), 'dd/MM/yy') : '—'}</div>
                        </div>

                        {/* User groups */}
                        {u.groups && u.groups.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-1">Grupos ({u.groups.length})</p>
                            <div className="space-y-1">
                              {u.groups.map(g => (
                                <div key={g.group_id} className="bg-muted/30 rounded p-2 text-xs flex justify-between">
                                  <span className="font-medium">{g.group_name} <span className="text-muted-foreground">({g.role})</span></span>
                                  <span className="text-primary">+{formatCurrency(g.total_deposited)} / -{formatCurrency(g.total_withdrawn)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* User communities */}
                        {u.communities && u.communities.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-1">Comunidades ({u.communities.length})</p>
                            <div className="flex flex-wrap gap-1">
                              {u.communities.map((c, i) => (
                                <span key={i} className="bg-muted/50 rounded px-2 py-0.5 text-[10px]">{c}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant={u.is_premium ? "destructive" : "default"} onClick={() => togglePremium(u.id, u.is_premium)} className="h-7 text-xs">
                            <Crown className="w-3 h-3 mr-1" />{u.is_premium ? 'Remover VIP' : 'Dar VIP'}
                          </Button>
                          <Button size="sm" variant={u.role === 'admin' ? "destructive" : "outline"} onClick={() => toggleAdmin(u.id, u.role || 'user')} className="h-7 text-xs">
                            <Shield className="w-3 h-3 mr-1" />{u.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
                {filteredUsers.length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado.</p>}
              </div>
            )}
          </TabsContent>

          {/* ==================== GROUPS TAB ==================== */}
          <TabsContent value="groups" className="space-y-3 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou código..." value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} className="pl-10 h-9" />
            </div>
            <p className="text-xs text-muted-foreground">{filteredGroups.length} grupo(s)</p>

            {groupsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <div className="space-y-3">
                {filteredGroups.map((group) => {
                  const netAmount = group.total_deposits - group.total_withdrawals;
                  const progress = group.goal_amount > 0 ? (netAmount / group.goal_amount) * 100 : 0;
                  return (
                    <div key={group.id} className="glass-card p-3 space-y-2">
                      <div className="flex items-start gap-2" onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)} role="button">
                        {group.image_url ? (
                          <img src={group.image_url} alt={group.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><Target className="w-5 h-5 text-primary" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{group.name}</h3>
                          <p className="text-[10px] text-muted-foreground">{group.member_count} membros • {format(new Date(group.created_at!), 'dd/MM/yy')}</p>
                        </div>
                        {expandedGroup === group.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>

                      {/* Code */}
                      <div className="flex items-center gap-1 bg-muted/50 rounded p-1.5">
                        <Key className="w-3 h-3 text-muted-foreground" />
                        <code className="flex-1 font-mono text-xs font-bold tracking-widest">{group.invite_code}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyCode(group.invite_code)}><Copy className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRegenerateCode(group.id)} disabled={regeneratingCode === group.id}>
                          <RefreshCw className={`w-3 h-3 ${regeneratingCode === group.id ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-4 gap-1 text-center text-xs">
                        <div className="bg-muted/30 rounded p-1"><p className="font-bold text-primary">{formatCurrency(group.total_deposits)}</p><p className="text-[9px] text-muted-foreground">Depósitos</p></div>
                        <div className="bg-muted/30 rounded p-1"><p className="font-bold text-destructive">{formatCurrency(group.total_withdrawals)}</p><p className="text-[9px] text-muted-foreground">Retiradas</p></div>
                        <div className="bg-muted/30 rounded p-1"><p className="font-bold">{formatCurrency(netAmount)}</p><p className="text-[9px] text-muted-foreground">Líquido</p></div>
                        <div className="bg-muted/30 rounded p-1"><p className="font-bold">{formatCurrency(group.goal_amount)}</p><p className="text-[9px] text-muted-foreground">Meta</p></div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{Math.min(Math.max(progress, 0), 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(Math.max(progress, 0), 100)} className="h-1.5" />
                      </div>

                      {/* Expanded: member breakdown */}
                      {expandedGroup === group.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-1 pt-2 border-t border-border">
                          <p className="text-xs font-semibold">Membros</p>
                          {group.members.map(m => (
                            <div key={m.user_id} className="flex justify-between items-center bg-muted/20 rounded p-1.5 text-xs">
                              <span>{m.user_name} <span className="text-muted-foreground">({m.role})</span></span>
                              <span>+{formatCurrency(m.deposited)} / -{formatCurrency(m.withdrawn)}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
                {filteredGroups.length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhum grupo encontrado.</p>}
              </div>
            )}
          </TabsContent>

          {/* ==================== FINANCIAL TAB ==================== */}
          <TabsContent value="financial" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Hoje', value: financialStats.todayDeposits, icon: Calendar },
                { label: 'Este mês', value: financialStats.monthDeposits, icon: BarChart3 },
                { label: 'Este ano', value: financialStats.yearDeposits, icon: TrendingUp },
                { label: 'Total geral', value: financialStats.totalDeposits, icon: DollarSign },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="glass-card p-3 text-center">
                  <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-lg font-bold">{formatCurrency(value)}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Per-user financial breakdown */}
            <div>
              <p className="text-sm font-semibold mb-2">Economia por usuário</p>
              <div className="space-y-2">
                {filteredUsers.slice(0, 20).map(u => {
                  const userDeposits = allContributions.filter(c => c.user_id === u.id && c.type === 'deposit');
                  const userWithdrawals = allContributions.filter(c => c.user_id === u.id && c.type === 'withdrawal');
                  const totalDep = userDeposits.reduce((s: number, c: any) => s + Number(c.amount), 0);
                  const totalWith = userWithdrawals.reduce((s: number, c: any) => s + Number(c.amount), 0);
                  const days = daysSince(u.created_at) || 1;
                  const perDay = totalDep / days;
                  const perMonth = perDay * 30;
                  const perYear = perDay * 365;

                  if (totalDep === 0) return null;

                  return (
                    <div key={u.id} className="glass-card p-2 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{u.name}</span>
                        <span className="text-primary font-bold">{formatCurrency(totalDep - totalWith)} líq.</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div className="bg-muted/30 rounded p-1"><p className="font-bold">{formatCurrency(perDay)}</p><p className="text-[9px] text-muted-foreground">/dia</p></div>
                        <div className="bg-muted/30 rounded p-1"><p className="font-bold">{formatCurrency(perMonth)}</p><p className="text-[9px] text-muted-foreground">/mês</p></div>
                        <div className="bg-muted/30 rounded p-1"><p className="font-bold">{formatCurrency(perYear)}</p><p className="text-[9px] text-muted-foreground">/ano</p></div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          </TabsContent>

          {/* ==================== COUPONS TAB ==================== */}
          <TabsContent value="coupons" className="space-y-3 mt-4">
            <Button onClick={() => setShowCouponForm(!showCouponForm)} className="w-full h-8 text-xs">
              <Ticket className="w-3 h-3 mr-1" />{showCouponForm ? 'Cancelar' : 'Criar Novo Cupom'}
            </Button>

            {showCouponForm && (
              <div className="glass-card p-3 space-y-2">
                <Input placeholder="Código (ex: SAVE20)" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} className="h-8 text-xs" />
                <Input placeholder="Descrição" value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} className="h-8 text-xs" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Desconto %" value={couponForm.discount_percentage} onChange={(e) => setCouponForm({ ...couponForm, discount_percentage: e.target.value })} className="h-8 text-xs" />
                  <Input type="number" placeholder="Usos máximos" value={couponForm.max_uses} onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })} className="h-8 text-xs" />
                </div>
                <Input type="date" value={couponForm.valid_until} onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })} className="h-8 text-xs" />
                <Button onClick={createCoupon} className="w-full h-8 text-xs" disabled={!couponForm.code}>Criar Cupom</Button>
              </div>
            )}

            {/* Active coupons */}
            {couponsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <div className="space-y-2">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="glass-card p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <code className="font-mono font-bold">{coupon.code}</code>
                        {coupon.discount_percentage && <span className="ml-1 text-xs text-primary">{coupon.discount_percentage}% off</span>}
                      </div>
                      <Button size="sm" variant={coupon.is_active ? "default" : "outline"} onClick={() => toggleCoupon(coupon.id, coupon.is_active)} className="h-6 text-[10px]">
                        {coupon.is_active ? <><ToggleRight className="w-3 h-3 mr-0.5" />Ativo</> : <><ToggleLeft className="w-3 h-3 mr-0.5" />Inativo</>}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{coupon.description}</p>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>Usos: {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</span>
                      {coupon.valid_until && <span>Até: {format(new Date(coupon.valid_until), 'dd/MM/yy')}</span>}
                    </div>
                  </div>
                ))}
                {coupons.length === 0 && <p className="text-center py-4 text-muted-foreground text-xs">Nenhum cupom cadastrado.</p>}
              </div>
            )}

            {/* Coupon usages */}
            {couponUsages.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Cupons Resgatados</p>
                <div className="space-y-1">
                  {couponUsages.map(cu => (
                    <div key={cu.id} className="flex justify-between items-center bg-muted/30 rounded p-2 text-xs">
                      <span><code className="font-mono font-semibold">{cu.coupon_code}</code> — {cu.user_name}</span>
                      <span className="text-muted-foreground">{format(new Date(cu.used_at), 'dd/MM/yy')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
