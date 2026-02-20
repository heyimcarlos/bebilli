import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Target, Key, Copy, RefreshCw, Loader2, Search, 
  TrendingUp, Crown, Shield, UserCog, Ticket, Mail, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

// ===== Types =====
interface UserWithRole {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  is_premium: boolean;
  level: number;
  total_contributions: number;
  created_at: string;
  country: string | null;
  city: string | null;
  phone: string | null;
  role?: string;
}

interface GroupWithStats {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  goal_amount: number;
  invite_code: string;
  created_at: string;
  member_count: number;
  total_contributions: number;
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

// ===== Component =====
const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { toast } = useToast();
  const { formatCurrency, t } = useApp();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  
  // Users state
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  
  // Groups state
  const [groups, setGroups] = useState<GroupWithStats[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [regeneratingCode, setRegeneratingCode] = useState<string | null>(null);
  
  // Coupons state
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_percentage: '',
    max_uses: '',
    valid_until: '',
  });

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

  // Fetch data when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
      fetchGroups();
      fetchCoupons();
    }
  }, [isAuthorized]);

  // ===== USERS =====
  const fetchUsers = async () => {
    setUsersLoading(true);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    const roleMap = new Map<string, string>();
    roles?.forEach(r => roleMap.set(r.user_id, r.role));

    const usersWithRoles: UserWithRole[] = (profiles || []).map(p => ({
      id: p.id,
      name: p.name,
      email: '', // Will be filled from auth if needed
      avatar_url: p.avatar_url,
      is_premium: p.is_premium || false,
      level: p.level || 1,
      total_contributions: p.total_contributions || 0,
      created_at: p.created_at || '',
      country: p.country,
      city: p.city,
      phone: p.phone,
      role: roleMap.get(p.id) || 'user',
    }));

    setUsers(usersWithRoles);
    setUsersLoading(false);
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: !currentStatus })
      .eq('id', userId);

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: currentStatus ? 'Premium desativado' : 'Premium ativado!' });
      fetchUsers();
    }
  };

  const toggleAdmin = async (userId: string, currentRole: string) => {
    if (currentRole === 'admin') {
      // Remove admin role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Admin removido' });
        fetchUsers();
      }
    } else {
      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' as any });
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Admin adicionado!' });
        fetchUsers();
      }
    }
  };

  const sendPasswordReset = async (userId: string, userName: string) => {
    // We need the email - for now show a toast explaining
    toast({
      title: 'Redefinição de senha',
      description: `Para enviar reset de senha, o usuário ${userName} deve usar "Esqueceu a senha?" na tela de login.`,
    });
  };

  // ===== GROUPS =====
  const fetchGroups = async () => {
    setGroupsLoading(true);
    const { data: groupsData } = await supabase
      .from('groups')
      .select('id, name, description, image_url, goal_amount, invite_code, created_at')
      .order('created_at', { ascending: false });

    const groupsWithStats: GroupWithStats[] = await Promise.all(
      (groupsData || []).map(async (group) => {
        const [membersRes, contributionsRes] = await Promise.all([
          supabase.from('group_memberships').select('id', { count: 'exact' }).eq('group_id', group.id),
          supabase.from('contributions').select('amount').eq('group_id', group.id),
        ]);
        const totalContributions = (contributionsRes.data || []).reduce((sum, c) => sum + Number(c.amount), 0);
        return { ...group, member_count: membersRes.count || 0, total_contributions: totalContributions };
      })
    );

    setGroups(groupsWithStats);
    setGroupsLoading(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Código copiado!', description: code });
  };

  const handleRegenerateCode = async (groupId: string) => {
    setRegeneratingCode(groupId);
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase.from('groups').update({ invite_code: newCode }).eq('id', groupId);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível regenerar.', variant: 'destructive' });
    } else {
      toast({ title: 'Código regenerado!', description: newCode });
      fetchGroups();
    }
    setRegeneratingCode(null);
  };

  // ===== COUPONS =====
  const fetchCoupons = async () => {
    setCouponsLoading(true);
    const { data } = await supabase
      .from('subscription_coupons')
      .select('*')
      .order('created_at', { ascending: false });
    setCoupons(data || []);
    setCouponsLoading(false);
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

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Cupom criado!' });
      setCouponForm({ code: '', description: '', discount_percentage: '', max_uses: '', valid_until: '' });
      setShowCouponForm(false);
      fetchCoupons();
    }
  };

  const toggleCoupon = async (couponId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('subscription_coupons')
      .update({ is_active: !isActive })
      .eq('id', couponId);
    if (!error) {
      toast({ title: isActive ? 'Cupom desativado' : 'Cupom ativado!' });
      fetchCoupons();
    }
  };

  // ===== STATS =====
  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.is_premium).length;
  const totalGroupsCount = groups.length;
  const totalGroupContributions = groups.reduce((sum, g) => sum + g.total_contributions, 0);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
    g.invite_code.toLowerCase().includes(groupSearch.toLowerCase())
  );

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Gestão completa da plataforma</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Users, label: 'Usuários', value: totalUsers, color: 'text-primary' },
            { icon: Crown, label: 'Premium', value: premiumUsers, color: 'text-accent' },
            { icon: Target, label: 'Grupos', value: totalGroupsCount, color: 'text-primary' },
            { icon: TrendingUp, label: 'Aportado', value: formatCurrency(totalGroupContributions), color: 'text-accent' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-3 text-center"
            >
              <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
              <p className="text-lg font-bold">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="users" className="text-xs">
              <UserCog className="w-3 h-3 mr-1" />Usuários
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-xs">
              <Target className="w-3 h-3 mr-1" />Grupos
            </TabsTrigger>
            <TabsTrigger value="coupons" className="text-xs">
              <Ticket className="w-3 h-3 mr-1" />Cupons
            </TabsTrigger>
          </TabsList>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="glass-card p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{u.name}</h3>
                          {u.role === 'admin' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">ADMIN</span>
                          )}
                          {u.is_premium && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">VIP</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Nível {u.level} • {u.total_contributions} depósitos
                          {u.country && ` • ${u.country}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={u.is_premium ? "destructive" : "default"}
                        onClick={() => togglePremium(u.id, u.is_premium)}
                        className="h-7 text-xs"
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        {u.is_premium ? 'Remover VIP' : 'Dar VIP'}
                      </Button>
                      <Button
                        size="sm"
                        variant={u.role === 'admin' ? "destructive" : "outline"}
                        onClick={() => toggleAdmin(u.id, u.role || 'user')}
                        className="h-7 text-xs"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {u.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendPasswordReset(u.id, u.name)}
                        className="h-7 text-xs"
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Reset Senha
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado.</p>
                )}
              </div>
            )}
          </TabsContent>

          {/* GROUPS TAB */}
          <TabsContent value="groups" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {groupsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGroups.map((group) => {
                  const progress = group.goal_amount > 0 ? (group.total_contributions / group.goal_amount) * 100 : 0;
                  return (
                    <div key={group.id} className="glass-card p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        {group.image_url ? (
                          <img src={group.image_url} alt={group.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Target className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{group.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{group.description || 'Sem descrição'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                        <Key className="w-4 h-4 text-muted-foreground" />
                        <code className="flex-1 font-mono text-sm font-bold tracking-widest">{group.invite_code}</code>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyCode(group.invite_code)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRegenerateCode(group.id)} disabled={regeneratingCode === group.id}>
                          <RefreshCw className={`w-4 h-4 ${regeneratingCode === group.id ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/30 rounded-lg p-2">
                          <p className="text-lg font-bold">{group.member_count}</p>
                          <p className="text-xs text-muted-foreground">Membros</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-2">
                          <p className="text-lg font-bold">{formatCurrency(group.total_contributions)}</p>
                          <p className="text-xs text-muted-foreground">Aportado</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-2">
                          <p className="text-lg font-bold">{formatCurrency(group.goal_amount)}</p>
                          <p className="text-xs text-muted-foreground">Meta</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{Math.min(progress, 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                      </div>
                    </div>
                  );
                })}
                {filteredGroups.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">Nenhum grupo encontrado.</p>
                )}
              </div>
            )}
          </TabsContent>

          {/* COUPONS TAB */}
          <TabsContent value="coupons" className="space-y-4 mt-4">
            <Button onClick={() => setShowCouponForm(!showCouponForm)} className="w-full">
              <Ticket className="w-4 h-4 mr-2" />
              {showCouponForm ? 'Cancelar' : 'Criar Novo Cupom'}
            </Button>

            {showCouponForm && (
              <div className="glass-card p-4 space-y-3">
                <Input
                  placeholder="Código (ex: SAVE20)"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                />
                <Input
                  placeholder="Descrição"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Desconto %"
                    value={couponForm.discount_percentage}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_percentage: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Usos máximos"
                    value={couponForm.max_uses}
                    onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })}
                  />
                </div>
                <Input
                  type="date"
                  placeholder="Válido até"
                  value={couponForm.valid_until}
                  onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })}
                />
                <Button onClick={createCoupon} className="w-full" disabled={!couponForm.code}>
                  Criar Cupom
                </Button>
              </div>
            )}

            {couponsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="glass-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <code className="font-mono font-bold text-lg">{coupon.code}</code>
                        {coupon.discount_percentage && (
                          <span className="ml-2 text-sm text-primary font-medium">{coupon.discount_percentage}% off</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={coupon.is_active ? "default" : "outline"}
                        onClick={() => toggleCoupon(coupon.id, coupon.is_active)}
                        className="h-7 text-xs"
                      >
                        {coupon.is_active ? (
                          <><ToggleRight className="w-3 h-3 mr-1" />Ativo</>
                        ) : (
                          <><ToggleLeft className="w-3 h-3 mr-1" />Inativo</>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{coupon.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Usos: {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</span>
                      {coupon.valid_until && <span>Até: {new Date(coupon.valid_until).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
                {coupons.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">Nenhum cupom cadastrado.</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
