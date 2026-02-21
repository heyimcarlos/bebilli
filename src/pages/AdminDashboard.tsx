import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Target, Key, Copy, RefreshCw, Loader2, Search, 
  TrendingUp, Crown, Shield, UserCog, Ticket, Mail, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, DollarSign, Calendar, Filter, BarChart3, Eye,
  Activity, Globe, Coins, CreditCard, Receipt, Download
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
import { exportToExcel } from '@/lib/excelExport';

// ===== Types =====
interface UserFull {
  id: string;
  name: string;
  email?: string;
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
  const { formatCurrency, t } = useApp();
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
  
  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

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
      fetchUserEmails();
    }
  }, [isAuthorized]);

  // Fetch user emails via edge function
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const fetchUserEmails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase.functions.invoke('admin-user-emails');
      if (!error && data?.emails) {
        setUserEmails(data.emails);
      }
    } catch (e) {
      console.error('Failed to fetch user emails:', e);
    }
  };

  const fetchAll = () => {
    fetchUsers();
    fetchGroups();
    fetchCoupons();
    fetchContributions();
    fetchCouponUsages();
    fetchSubscriptions();
  };

  // ===== FETCH SUBSCRIPTIONS =====
  const fetchSubscriptions = async () => {
    setSubscriptionsLoading(true);
    const { data } = await supabase.from('user_subscriptions').select('*').order('created_at', { ascending: false });
    if (data) {
      // Enrich with user names
      const userIds = [...new Set(data.map((s: any) => s.user_id))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from('profiles').select('id, name').in('id', userIds)
        : { data: [] };
      const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.name]));

      // Enrich with coupon codes
      const couponIds = [...new Set(data.filter((s: any) => s.coupon_id).map((s: any) => s.coupon_id))];
      const { data: couponsData } = couponIds.length > 0
        ? await supabase.from('subscription_coupons').select('id, code').in('id', couponIds)
        : { data: [] };
      const couponMap = new Map((couponsData || []).map((c: any) => [c.id, c.code]));

      setSubscriptions(data.map((s: any) => ({
        ...s,
        user_name: nameMap.get(s.user_id) || 'Desconhecido',
        coupon_code: s.coupon_id ? couponMap.get(s.coupon_id) || '—' : '—',
      })));
    }
    setSubscriptionsLoading(false);
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
    const { error } = await supabase.from('profiles').update({ is_premium: !current }).eq('id', userId);
    if (error) { toast({ title: t('error'), description: error.message, variant: 'destructive' }); return; }
    toast({ title: current ? t('adminPremiumDeactivated') : t('adminPremiumActivated') });
    fetchUsers();
  };

  const toggleAdmin = async (userId: string, currentRole: string) => {
    try {
      if (currentRole === 'admin') {
        const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
        if (error) throw error;
        toast({ title: t('adminAdminRemoved') });
      } else {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' as any });
        if (error) throw error;
        toast({ title: t('adminAdminAdded') });
      }
      fetchUsers();
    } catch (err: any) {
      toast({ title: t('error'), description: err.message || 'Failed to update role', variant: 'destructive' });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: t('adminCodeCopied'), description: code });
  };

  const handleRegenerateCode = async (groupId: string) => {
    setRegeneratingCode(groupId);
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await supabase.from('groups').update({ invite_code: newCode }).eq('id', groupId);
    toast({ title: t('adminCodeRegenerated'), description: newCode });
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
    if (error) { toast({ title: t('error'), description: error.message, variant: 'destructive' }); }
    else {
      toast({ title: t('adminCouponCreated') });
      setCouponForm({ code: '', description: '', discount_percentage: '', max_uses: '', valid_until: '' });
      setShowCouponForm(false);
      fetchCoupons();
    }
  };

  const toggleCoupon = async (couponId: string, isActive: boolean) => {
    await supabase.from('subscription_coupons').update({ is_active: !isActive }).eq('id', couponId);
    toast({ title: isActive ? t('adminDeactivate') : t('adminActivate') });
    fetchCoupons();
  };

  // ===== EXCEL EXPORTS =====
  const exportUsers = () => {
    const rows = filteredUsers.map(u => {
      const behavior = getUserBehavior(u);
      return {
        [t('name')]: u.name,
        [t('email')]: userEmails[u.id] || '',
        [t('country')]: u.country || '',
        [t('city')]: u.city || '',
        [t('phone')]: u.phone || '',
        [t('adminLanguage')]: u.language || '',
        [t('adminCurrency')]: u.currency || '',
        [t('level')]: u.level,
        'Premium': u.is_premium ? '✓' : '✗',
        'Role': u.role || 'user',
        'Status': behavior.status,
        'Engajamento': behavior.engagement,
        [t('adminCurrentStreak')]: u.current_streak,
        [t('adminBestStreak')]: u.best_streak,
        [t('adminTotalDeposits')]: u.total_contributions,
        'Valor médio aporte': behavior.avgContribValue.toFixed(2),
        'Total depositado': behavior.totalDeposited.toFixed(2),
        [t('adminMaxSaved')]: u.max_saved,
        [t('adminDaysInApp')]: behavior.daysInApp,
        'Dias sem aporte': behavior.daysSinceLastContrib,
        'Intervalo médio (dias)': behavior.avgGapDays.toFixed(1),
        'Aportes/semana': (behavior.contribFreq * 7).toFixed(2),
        [t('adminRegistration')]: u.created_at ? format(new Date(u.created_at), 'dd/MM/yyyy') : '',
        [t('adminLastContribution')]: u.last_contribution_at ? format(new Date(u.last_contribution_at), 'dd/MM/yyyy') : '',
        [t('adminGroups2')]: (u.groups || []).map(g => g.group_name).join(', '),
        [t('adminCommunities')]: (u.communities || []).join(', '),
      };
    });
    exportToExcel([{ sheetName: t('adminUsers'), rows }], 'billi-users');
  };

  const exportGroups = () => {
    const rows = filteredGroups.map(g => ({
      [t('name')]: g.name,
      [t('description')]: g.description || '',
      [t('adminCode')]: g.invite_code,
      [t('adminMembers')]: g.member_count,
      [t('adminDepositsLabel')]: g.total_deposits,
      [t('adminWithdrawals')]: g.total_withdrawals,
      [t('adminNet')]: g.total_deposits - g.total_withdrawals,
      [t('adminGoal')]: g.goal_amount,
      [t('adminProgress') + ' %']: g.goal_amount > 0 ? ((g.total_deposits - g.total_withdrawals) / g.goal_amount * 100).toFixed(1) : '0',
      [t('adminCreation')]: g.created_at ? format(new Date(g.created_at), 'dd/MM/yyyy') : '',
    }));
    exportToExcel([{ sheetName: t('adminGroups'), rows }], 'billi-groups');
  };

  const exportFinancial = () => {
    const rows = filteredUsers.filter(u => {
      const userDeps = allContributions.filter(c => c.user_id === u.id && c.type === 'deposit');
      return userDeps.length > 0;
    }).map(u => {
      const deps = allContributions.filter(c => c.user_id === u.id && c.type === 'deposit');
      const withs = allContributions.filter(c => c.user_id === u.id && c.type === 'withdrawal');
      const totalDep = deps.reduce((s: number, c: any) => s + Number(c.amount), 0);
      const totalWith = withs.reduce((s: number, c: any) => s + Number(c.amount), 0);
      const days = daysSince(u.created_at) || 1;
      return {
        [t('name')]: u.name,
        [t('email')]: userEmails[u.id] || '',
        [t('adminDepositsLabel')]: totalDep,
        [t('adminWithdrawals')]: totalWith,
        [t('adminNet')]: totalDep - totalWith,
        [t('adminAvgPerDay')]: (totalDep / days).toFixed(2),
        [t('adminProjectionMonth')]: (totalDep / days * 30).toFixed(2),
        [t('adminProjectionYear')]: (totalDep / days * 365).toFixed(2),
      };
    });
    exportToExcel([{ sheetName: t('adminFinancial'), rows }], 'billi-financial');
  };

  const exportSubscriptions = () => {
    const rows = subscriptions.map((s: any) => ({
      [t('name')]: s.user_name,
      [t('adminPlan')]: s.plan_type === 'annual' ? t('adminAnnual') : t('adminMonthly'),
      [t('adminStatus')]: s.status,
      [t('adminValue')]: `${s.currency} ${Number(s.amount).toFixed(2)}`,
      [t('adminPayment')]: s.payment_method,
      [t('adminCoupon')]: s.coupon_code,
      [t('adminSubscriptionDate')]: s.subscribed_at ? format(new Date(s.subscribed_at), 'dd/MM/yyyy') : '',
      [t('adminRenewal')]: s.renewal_date ? format(new Date(s.renewal_date), 'dd/MM/yyyy') : '',
      [t('adminExpiration')]: s.expires_at ? format(new Date(s.expires_at), 'dd/MM/yyyy') : '',
    }));
    exportToExcel([{ sheetName: t('adminSubscriptions'), rows }], 'billi-subscriptions');
  };

  const exportCoupons = () => {
    const couponRows = coupons.map(c => ({
      [t('adminCouponCode')]: c.code,
      [t('adminCouponDescription')]: c.description || '',
      [t('adminDiscountPercent')]: c.discount_percentage || '',
      [t('adminValue')]: c.discount_amount || '',
      [t('adminStatus')]: c.is_active ? '✓' : '✗',
      [t('adminUsages')]: c.current_uses,
      [t('adminMaxUses')]: c.max_uses || t('adminUnlimited'),
      [t('adminValidUntil')]: c.valid_until ? format(new Date(c.valid_until), 'dd/MM/yyyy') : t('adminNoLimit'),
    }));
    const usageRows = couponUsages.map(cu => ({
      [t('adminCoupon')]: cu.coupon_code,
      [t('name')]: cu.user_name,
      [t('adminUsedAt')]: format(new Date(cu.used_at), 'dd/MM/yyyy'),
    }));
    exportToExcel([
      { sheetName: t('adminCoupons'), rows: couponRows },
      { sheetName: t('adminRedemptions'), rows: usageRows },
    ], 'billi-coupons');
  };

  const exportAll = () => {
    const usersRows = filteredUsers.map(u => ({
      [t('name')]: u.name, [t('email')]: userEmails[u.id] || '', [t('country')]: u.country || '', [t('level')]: u.level,
      'Premium': u.is_premium ? '✓' : '✗', [t('adminCurrentStreak')]: u.current_streak,
      [t('adminTotalDeposits')]: u.total_contributions, [t('adminMaxSaved')]: u.max_saved,
    }));
    const groupsRows = filteredGroups.map(g => ({
      [t('name')]: g.name, [t('adminMembers')]: g.member_count, [t('adminDepositsLabel')]: g.total_deposits,
      [t('adminGoal')]: g.goal_amount, [t('adminCode')]: g.invite_code,
    }));
    const subsRows = subscriptions.map((s: any) => ({
      [t('name')]: s.user_name, [t('adminPlan')]: s.plan_type, [t('adminStatus')]: s.status,
      [t('adminValue')]: `${s.currency} ${Number(s.amount).toFixed(2)}`,
    }));
    exportToExcel([
      { sheetName: t('adminUsers'), rows: usersRows },
      { sheetName: t('adminGroups'), rows: groupsRows },
      { sheetName: t('adminSubscriptions'), rows: subsRows },
    ], 'billi-full-report');
  };
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

  // Days since a date
  const daysSince = (dateStr: string) => {
    if (!dateStr) return 0;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  };

  // Behavioral metrics per user
  const getUserBehavior = (u: UserFull) => {
    const daysInApp = daysSince(u.created_at) || 1;
    const daysSinceLastContrib = u.last_contribution_at ? daysSince(u.last_contribution_at) : daysInApp;
    const contribFreq = u.total_contributions / daysInApp; // contributions per day
    const userContribs = allContributions.filter(c => c.user_id === u.id && c.type === 'deposit');
    const totalDeposited = userContribs.reduce((s: number, c: any) => s + Number(c.amount), 0);
    const avgContribValue = u.total_contributions > 0 ? totalDeposited / u.total_contributions : 0;

    // Average days between contributions
    const contribDates = userContribs
      .map((c: any) => new Date(c.created_at).getTime())
      .sort((a: number, b: number) => a - b);
    let avgGapDays = 0;
    if (contribDates.length > 1) {
      const gaps = contribDates.slice(1).map((d: number, i: number) => (d - contribDates[i]) / (1000 * 60 * 60 * 24));
      avgGapDays = gaps.reduce((s: number, g: number) => s + g, 0) / gaps.length;
    }

    // Engagement score (0-100)
    const streakScore = Math.min(u.current_streak / 30, 1) * 30;
    const freqScore = Math.min(contribFreq * 7, 1) * 30; // at least 1/week = max
    const recencyScore = Math.max(0, 1 - daysSinceLastContrib / 30) * 25;
    const levelScore = Math.min(u.level / 10, 1) * 15;
    const engagement = Math.round(streakScore + freqScore + recencyScore + levelScore);

    // Status label
    let status = '🔴 Inativo';
    if (daysSinceLastContrib <= 1) status = '🟢 Ativo hoje';
    else if (daysSinceLastContrib <= 3) status = '🟢 Ativo';
    else if (daysSinceLastContrib <= 7) status = '🟡 Regular';
    else if (daysSinceLastContrib <= 30) status = '🟠 Esfriando';

    return { daysInApp, daysSinceLastContrib, contribFreq, avgContribValue, avgGapDays, engagement, status, totalDeposited };
  };

  // Platform-wide behavioral stats
  const platformStats = useMemo(() => {
    const activeToday = users.filter(u => u.last_contribution_at && daysSince(u.last_contribution_at) <= 1).length;
    const activeWeek = users.filter(u => u.last_contribution_at && daysSince(u.last_contribution_at) <= 7).length;
    const activeMonth = users.filter(u => u.last_contribution_at && daysSince(u.last_contribution_at) <= 30).length;
    const inactive = users.filter(u => !u.last_contribution_at || daysSince(u.last_contribution_at) > 30).length;
    const avgStreak = users.length > 0 ? (users.reduce((s, u) => s + u.current_streak, 0) / users.length).toFixed(1) : '0';
    const avgLevel = users.length > 0 ? (users.reduce((s, u) => s + u.level, 0) / users.length).toFixed(1) : '0';
    const avgContribs = users.length > 0 ? (users.reduce((s, u) => s + u.total_contributions, 0) / users.length).toFixed(1) : '0';
    return { activeToday, activeWeek, activeMonth, inactive, avgStreak, avgLevel, avgContribs };
  }, [users]);

  if (isAuthorized === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-2">{t('adminAccessDenied')}</h1>
        <p className="text-muted-foreground mb-4">{t('adminNoPermission')}</p>
        <Button onClick={onBack}>{t('back')}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">{t('adminPanel')}</h1>
            <p className="text-sm text-muted-foreground">{t('adminPlatformManagement')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportAll} className="h-8 text-xs ml-auto">
            <Download className="w-3 h-3 mr-1" />Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Users, label: t('adminUsers'), value: totalUsers },
            { icon: Crown, label: 'Premium', value: premiumUsers },
            { icon: Target, label: t('adminGroups'), value: totalGroupsCount },
            { icon: TrendingUp, label: t('adminNet'), value: formatCurrency(totalGroupNet) },
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
            <Globe className="w-3 h-3 mr-1" /><SelectValue placeholder={t('country')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('adminAllCountries')}</SelectItem>
            {availableCountries.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCurrency} onValueChange={setFilterCurrency}>
          <SelectTrigger className="h-8 text-xs flex-1">
            <Coins className="w-3 h-3 mr-1" /><SelectValue placeholder={t('currency')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('adminAllCurrencies')}</SelectItem>
            {availableCurrencies.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5 h-9">
            <TabsTrigger value="users" className="text-[10px] px-1"><UserCog className="w-3 h-3 mr-0.5" />{t('adminUsers')}</TabsTrigger>
            <TabsTrigger value="groups" className="text-[10px] px-1"><Target className="w-3 h-3 mr-0.5" />{t('adminGroups')}</TabsTrigger>
            <TabsTrigger value="financial" className="text-[10px] px-1"><BarChart3 className="w-3 h-3 mr-0.5" />{t('adminFinancial')}</TabsTrigger>
            <TabsTrigger value="subscriptions" className="text-[10px] px-1"><CreditCard className="w-3 h-3 mr-0.5" />{t('adminSubscriptions')}</TabsTrigger>
            <TabsTrigger value="coupons" className="text-[10px] px-1"><Ticket className="w-3 h-3 mr-0.5" />{t('adminCoupons')}</TabsTrigger>
          </TabsList>

          {/* ==================== USERS TAB ==================== */}
          <TabsContent value="users" className="space-y-3 mt-4">
            <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={exportUsers} className="h-7 text-[10px]"><Download className="w-3 h-3 mr-1" />Excel</Button></div>

            {/* Platform Behavior Summary */}
            <div className="grid grid-cols-4 gap-2">
              <div className="glass-card p-2 text-center">
                <p className="text-lg font-bold text-green-500">{platformStats.activeToday}</p>
                <p className="text-[9px] text-muted-foreground">Ativos hoje</p>
              </div>
              <div className="glass-card p-2 text-center">
                <p className="text-lg font-bold text-blue-500">{platformStats.activeWeek}</p>
                <p className="text-[9px] text-muted-foreground">Ativos 7d</p>
              </div>
              <div className="glass-card p-2 text-center">
                <p className="text-lg font-bold text-amber-500">{platformStats.activeMonth}</p>
                <p className="text-[9px] text-muted-foreground">Ativos 30d</p>
              </div>
              <div className="glass-card p-2 text-center">
                <p className="text-lg font-bold text-destructive">{platformStats.inactive}</p>
                <p className="text-[9px] text-muted-foreground">Inativos</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="glass-card p-2 text-center">
                <p className="text-sm font-bold">{platformStats.avgStreak}</p>
                <p className="text-[9px] text-muted-foreground">Streak médio</p>
              </div>
              <div className="glass-card p-2 text-center">
                <p className="text-sm font-bold">{platformStats.avgLevel}</p>
                <p className="text-[9px] text-muted-foreground">Nível médio</p>
              </div>
              <div className="glass-card p-2 text-center">
                <p className="text-sm font-bold">{platformStats.avgContribs}</p>
                <p className="text-[9px] text-muted-foreground">Aportes médio</p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('adminSearchUsers')} value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-10 h-9" />
            </div>
            <p className="text-xs text-muted-foreground">{filteredUsers.length} {t('adminUserCount')}</p>

            {usersLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((u) => {
                  const behavior = getUserBehavior(u);
                  return (
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
                          {behavior.status} • Nv{u.level} • 🔥{u.current_streak}d • {u.country || '—'}
                        </p>
                        {userEmails[u.id] && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />{userEmails[u.id]}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-xs font-bold ${behavior.engagement >= 60 ? 'text-green-500' : behavior.engagement >= 30 ? 'text-amber-500' : 'text-destructive'}`}>
                          {behavior.engagement}%
                        </div>
                        <p className="text-[9px] text-muted-foreground">engajamento</p>
                      </div>
                      {expandedUser === u.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>

                    {/* Expanded details */}
                    {expandedUser === u.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 pt-2 border-t border-border">
                        
                        {/* Behavioral metrics */}
                        <div>
                          <p className="text-xs font-semibold mb-1.5 flex items-center gap-1"><Activity className="w-3 h-3" /> Comportamento</p>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="bg-muted/40 rounded-lg p-2 text-center">
                              <p className="text-sm font-bold">{behavior.daysInApp}</p>
                              <p className="text-[9px] text-muted-foreground">Dias no app</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg p-2 text-center">
                              <p className={`text-sm font-bold ${behavior.daysSinceLastContrib <= 3 ? 'text-green-500' : behavior.daysSinceLastContrib <= 7 ? 'text-amber-500' : 'text-destructive'}`}>
                                {behavior.daysSinceLastContrib}d
                              </p>
                              <p className="text-[9px] text-muted-foreground">Sem aporte</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg p-2 text-center">
                              <p className="text-sm font-bold">{behavior.avgGapDays.toFixed(1)}d</p>
                              <p className="text-[9px] text-muted-foreground">Intervalo médio</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg p-2 text-center">
                              <p className="text-sm font-bold">{u.total_contributions}</p>
                              <p className="text-[9px] text-muted-foreground">Nº aportes</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg p-2 text-center">
                              <p className="text-sm font-bold">{(behavior.contribFreq * 7).toFixed(1)}</p>
                              <p className="text-[9px] text-muted-foreground">Aportes/sem</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg p-2 text-center">
                              <p className="text-sm font-bold">{formatCurrency(behavior.avgContribValue)}</p>
                              <p className="text-[9px] text-muted-foreground">Valor médio</p>
                            </div>
                          </div>
                        </div>

                        {/* Streaks & Level */}
                        <div>
                          <p className="text-xs font-semibold mb-1.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Gamificação</p>
                          <div className="grid grid-cols-4 gap-1.5">
                            <div className="bg-muted/40 rounded-lg p-2 text-center">
                              <p className="text-sm font-bold">🔥 {u.current_streak}</p>
                              <p className="text-[9px] text-muted-foreground">Streak atual</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg p-2 text-center">
                              <p className="text-sm font-bold">⚡ {u.best_streak}</p>
                              <p className="text-[9px] text-muted-foreground">Melhor streak</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg p-2 text-center">
                              <p className="text-sm font-bold">Nv{u.level}</p>
                              <p className="text-[9px] text-muted-foreground">Nível</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg p-2 text-center">
                              <p className="text-sm font-bold">{formatCurrency(u.max_saved)}</p>
                              <p className="text-[9px] text-muted-foreground">Máx salvo</p>
                            </div>
                          </div>
                        </div>

                        {/* Engagement bar */}
                        <div>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-muted-foreground">Score de engajamento</span>
                            <span className="font-bold">{behavior.engagement}/100</span>
                          </div>
                          <Progress value={behavior.engagement} className="h-2" />
                        </div>

                        {/* Financial summary */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="bg-primary/10 rounded-lg p-2 text-center">
                            <p className="text-sm font-bold text-primary">{formatCurrency(behavior.totalDeposited)}</p>
                            <p className="text-[9px] text-muted-foreground">Total depositado</p>
                          </div>
                          <div className="bg-muted/40 rounded-lg p-2 text-center">
                            <p className="text-sm font-bold">{formatCurrency(behavior.totalDeposited / behavior.daysInApp * 30)}</p>
                            <p className="text-[9px] text-muted-foreground">Projeção/mês</p>
                          </div>
                        </div>

                        {/* Profile details */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground">{t('adminCity')}:</span> {u.city || '—'}</div>
                          <div><span className="text-muted-foreground">{t('adminPhone')}:</span> {u.phone || '—'}</div>
                          <div><span className="text-muted-foreground">{t('adminLanguage')}:</span> {u.language || '—'}</div>
                          <div><span className="text-muted-foreground">{t('adminCurrency')}:</span> {u.currency || '—'}</div>
                          <div><span className="text-muted-foreground">{t('adminRegistration')}:</span> {u.created_at ? format(new Date(u.created_at), 'dd/MM/yyyy') : '—'}</div>
                          <div><span className="text-muted-foreground">{t('adminLastContribution')}:</span> {u.last_contribution_at ? format(new Date(u.last_contribution_at), 'dd/MM/yy') : '—'}</div>
                        </div>

                        {/* User groups */}
                        {u.groups && u.groups.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-1">{t('adminGroups2')} ({u.groups.length})</p>
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
                            <p className="text-xs font-semibold mb-1">{t('adminCommunities')} ({u.communities.length})</p>
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
                            <Crown className="w-3 h-3 mr-1" />{u.is_premium ? t('adminRemoveVIP') : t('adminGiveVIP')}
                          </Button>
                          <Button size="sm" variant={u.role === 'admin' ? "destructive" : "outline"} onClick={() => toggleAdmin(u.id, u.role || 'user')} className="h-7 text-xs">
                            <Shield className="w-3 h-3 mr-1" />{u.role === 'admin' ? t('adminRemoveAdmin') : t('adminMakeAdmin')}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  );
                })}
                {filteredUsers.length === 0 && <p className="text-center py-8 text-muted-foreground">{t('adminNoUsersFound')}</p>}
              </div>
            )}
          </TabsContent>

          {/* ==================== GROUPS TAB ==================== */}
          <TabsContent value="groups" className="space-y-3 mt-4">
            <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={exportGroups} className="h-7 text-[10px]"><Download className="w-3 h-3 mr-1" />Excel</Button></div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('adminSearchGroups')} value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} className="pl-10 h-9" />
            </div>
            <p className="text-xs text-muted-foreground">{filteredGroups.length} {t('adminGroupCount')}</p>

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
                          <p className="text-[10px] text-muted-foreground">{group.member_count} {t('members')} • {format(new Date(group.created_at!), 'dd/MM/yy')}</p>
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
                         <div className="bg-muted/30 rounded p-1"><p className="font-bold text-primary">{formatCurrency(group.total_deposits)}</p><p className="text-[9px] text-muted-foreground">{t('adminDepositsLabel')}</p></div>
                         <div className="bg-muted/30 rounded p-1"><p className="font-bold text-destructive">{formatCurrency(group.total_withdrawals)}</p><p className="text-[9px] text-muted-foreground">{t('adminWithdrawals')}</p></div>
                         <div className="bg-muted/30 rounded p-1"><p className="font-bold">{formatCurrency(netAmount)}</p><p className="text-[9px] text-muted-foreground">{t('adminNet')}</p></div>
                         <div className="bg-muted/30 rounded p-1"><p className="font-bold">{formatCurrency(group.goal_amount)}</p><p className="text-[9px] text-muted-foreground">{t('adminGoal')}</p></div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">{t('adminProgress')}</span>
                          <span className="font-medium">{Math.min(Math.max(progress, 0), 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(Math.max(progress, 0), 100)} className="h-1.5" />
                      </div>

                      {/* Expanded: member breakdown */}
                      {expandedGroup === group.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-1 pt-2 border-t border-border">
                          <p className="text-xs font-semibold">{t('adminMembers')}</p>
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
                {filteredGroups.length === 0 && <p className="text-center py-8 text-muted-foreground">{t('adminNoGroupsFound')}</p>}
              </div>
            )}
          </TabsContent>

          {/* ==================== FINANCIAL TAB ==================== */}
          <TabsContent value="financial" className="space-y-4 mt-4">
            <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={exportFinancial} className="h-7 text-[10px]"><Download className="w-3 h-3 mr-1" />Excel</Button></div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: t('adminToday'), value: financialStats.todayDeposits, icon: Calendar },
                { label: t('adminMonth'), value: financialStats.monthDeposits, icon: BarChart3 },
                { label: t('adminYear'), value: financialStats.yearDeposits, icon: TrendingUp },
                { label: t('adminTotal'), value: financialStats.totalDeposits, icon: DollarSign },
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
              <p className="text-sm font-semibold mb-2">{t('adminFinancial')}</p>
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
                        <span className="text-primary font-bold">{formatCurrency(totalDep - totalWith)} {t('adminNet').toLowerCase()}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                         <div className="bg-muted/30 rounded p-1"><p className="font-bold">{formatCurrency(perDay)}</p><p className="text-[9px] text-muted-foreground">/{t('adminToday').charAt(0).toLowerCase()}</p></div>
                         <div className="bg-muted/30 rounded p-1"><p className="font-bold">{formatCurrency(perMonth)}</p><p className="text-[9px] text-muted-foreground">/{t('adminMonth').charAt(0).toLowerCase()}</p></div>
                         <div className="bg-muted/30 rounded p-1"><p className="font-bold">{formatCurrency(perYear)}</p><p className="text-[9px] text-muted-foreground">/{t('adminYear').charAt(0).toLowerCase()}</p></div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          </TabsContent>

          {/* ==================== SUBSCRIPTIONS TAB ==================== */}
          <TabsContent value="subscriptions" className="space-y-3 mt-4">
            <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={exportSubscriptions} className="h-7 text-[10px]"><Download className="w-3 h-3 mr-1" />Excel</Button></div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="glass-card p-2 text-center">
                <p className="text-lg font-bold">{subscriptions.length}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
              <div className="glass-card p-2 text-center">
                <p className="text-lg font-bold text-primary">{subscriptions.filter((s: any) => s.status === 'active').length}</p>
                <p className="text-[10px] text-muted-foreground">{t('adminStatus')}</p>
              </div>
              <div className="glass-card p-2 text-center">
                <p className="text-lg font-bold">{subscriptions.filter((s: any) => s.plan_type === 'annual').length}</p>
                <p className="text-[10px] text-muted-foreground">{t('adminAnnual')}</p>
              </div>
            </div>

            {subscriptionsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : subscriptions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-xs">{t('adminNoSubscriptions')}</p>
            ) : (
              <div className="space-y-2">
                {subscriptions.map((sub: any) => (
                  <div key={sub.id} className="glass-card p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">{sub.user_name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        sub.status === 'active' ? 'bg-green-500/20 text-green-600' :
                        sub.status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
                        sub.status === 'expired' ? 'bg-muted text-muted-foreground' :
                        'bg-amber-500/20 text-amber-600'
                      }`}>
                        {sub.status === 'active' ? t('adminStatus') : sub.status === 'cancelled' ? t('cancel') : sub.status === 'expired' ? t('adminExpiration') : sub.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">{t('adminPlan')}:</span> {sub.plan_type === 'annual' ? t('adminAnnual') : t('adminMonthly')}</div>
                      <div><span className="text-muted-foreground">{t('adminValue')}:</span> {sub.currency} {Number(sub.amount).toFixed(2)}</div>
                      <div><span className="text-muted-foreground">{t('adminPayment')}:</span> {sub.payment_method}</div>
                      <div><span className="text-muted-foreground">{t('adminCoupon')}:</span> {sub.coupon_code}</div>
                      <div><span className="text-muted-foreground">{t('adminSubscriptionDate')}:</span> {sub.subscribed_at ? format(new Date(sub.subscribed_at), 'dd/MM/yy') : '—'}</div>
                      <div><span className="text-muted-foreground">{t('adminPayment')}:</span> {sub.payment_date ? format(new Date(sub.payment_date), 'dd/MM/yy') : '—'}</div>
                      <div><span className="text-muted-foreground">{t('adminRenewal')}:</span> {sub.renewal_date ? format(new Date(sub.renewal_date), 'dd/MM/yy') : '—'}</div>
                      <div><span className="text-muted-foreground">{t('adminExpiration')}:</span> {sub.expires_at ? format(new Date(sub.expires_at), 'dd/MM/yy') : '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ==================== COUPONS TAB ==================== */}
          <TabsContent value="coupons" className="space-y-3 mt-4">
            <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={exportCoupons} className="h-7 text-[10px]"><Download className="w-3 h-3 mr-1" />Excel</Button></div>
            <Button onClick={() => setShowCouponForm(!showCouponForm)} className="w-full h-8 text-xs">
              <Ticket className="w-3 h-3 mr-1" />{showCouponForm ? t('cancel') : t('adminCreateCoupon')}
            </Button>

            {showCouponForm && (
              <div className="glass-card p-3 space-y-2">
                <Input placeholder={t('adminCouponCode')} value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} className="h-8 text-xs" />
                <Input placeholder={t('adminCouponDescription')} value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} className="h-8 text-xs" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder={t('adminDiscountPercent')} value={couponForm.discount_percentage} onChange={(e) => setCouponForm({ ...couponForm, discount_percentage: e.target.value })} className="h-8 text-xs" />
                  <Input type="number" placeholder={t('adminMaxUses')} value={couponForm.max_uses} onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })} className="h-8 text-xs" />
                </div>
                <Input type="date" value={couponForm.valid_until} onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })} className="h-8 text-xs" />
                <Button onClick={createCoupon} className="w-full h-8 text-xs" disabled={!couponForm.code}>{t('adminCreateCoupon')}</Button>
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
                        {coupon.is_active ? <><ToggleRight className="w-3 h-3 mr-0.5" />{t('adminActivate')}</> : <><ToggleLeft className="w-3 h-3 mr-0.5" />{t('adminDeactivate')}</>}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{coupon.description}</p>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>{t('adminUsages')}: {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</span>
                      {coupon.valid_until && <span>{t('adminValidUntil')}: {format(new Date(coupon.valid_until), 'dd/MM/yy')}</span>}
                    </div>
                  </div>
                ))}
                {coupons.length === 0 && <p className="text-center py-4 text-muted-foreground text-xs">{t('adminNoCoupons')}</p>}
              </div>
            )}

            {/* Coupon usages */}
            {couponUsages.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">{t('adminRedemptions')}</p>
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
