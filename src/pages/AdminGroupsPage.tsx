import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Target, Key, Copy, RefreshCw, Loader2, Search, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

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

const AdminGroupsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { toast } = useToast();
  const { formatCurrency } = useApp();
  const [groups, setGroups] = useState<GroupWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regeneratingCode, setRegeneratingCode] = useState<string | null>(null);

  // Check admin authorization
  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthorized(false);
        return;
      }

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

  const fetchGroups = async () => {
    setLoading(true);

    // Fetch all groups with member count and contributions
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        description,
        image_url,
        goal_amount,
        invite_code,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
      setLoading(false);
      return;
    }

    // Fetch member counts for each group
    const groupsWithStats: GroupWithStats[] = await Promise.all(
      (groupsData || []).map(async (group) => {
        const [membersRes, contributionsRes] = await Promise.all([
          supabase
            .from('group_memberships')
            .select('id', { count: 'exact' })
            .eq('group_id', group.id),
          supabase
            .from('contributions')
            .select('amount')
            .eq('group_id', group.id)
        ]);

        const totalContributions = (contributionsRes.data || []).reduce(
          (sum, c) => sum + Number(c.amount),
          0
        );

        return {
          ...group,
          member_count: membersRes.count || 0,
          total_contributions: totalContributions,
        };
      })
    );

    setGroups(groupsWithStats);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchGroups();
    }
  }, [isAuthorized]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Código copiado!',
      description: `O código ${code} foi copiado para a área de transferência.`,
    });
  };

  const handleRegenerateCode = async (groupId: string) => {
    setRegeneratingCode(groupId);
    
    // Generate new code
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error } = await supabase
      .from('groups')
      .update({ invite_code: newCode })
      .eq('id', groupId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível regenerar o código.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Código regenerado!',
        description: `Novo código: ${newCode}`,
      });
      fetchGroups();
    }
    
    setRegeneratingCode(null);
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.invite_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMembers = groups.reduce((sum, g) => sum + g.member_count, 0);
  const totalContributions = groups.reduce((sum, g) => sum + g.total_contributions, 0);
  const totalGoals = groups.reduce((sum, g) => sum + g.goal_amount, 0);

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Unauthorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground mb-4">A página que você procura não existe.</p>
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
          <h1 className="text-2xl font-bold">Central de Grupos</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="px-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 text-center"
            >
              <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{groups.length}</p>
              <p className="text-xs text-muted-foreground">Grupos</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4 text-center"
            >
              <Users className="w-5 h-5 mx-auto mb-1 text-secondary-foreground" />
              <p className="text-2xl font-bold">{totalMembers}</p>
              <p className="text-xs text-muted-foreground">Membros</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-4 text-center"
            >
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-accent-foreground" />
              <p className="text-lg font-bold">{formatCurrency(totalContributions)}</p>
              <p className="text-xs text-muted-foreground">Aportado</p>
            </motion.div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Groups List */}
          <div className="space-y-4">
            {filteredGroups.map((group, index) => {
              const progress = group.goal_amount > 0 
                ? (group.total_contributions / group.goal_amount) * 100 
                : 0;

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    {group.image_url ? (
                      <img 
                        src={group.image_url} 
                        alt={group.name} 
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{group.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {group.description || 'Sem descrição'}
                      </p>
                    </div>
                  </div>

                  {/* Code Section */}
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    <code className="flex-1 font-mono text-sm font-bold tracking-widest">
                      {group.invite_code}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleCopyCode(group.invite_code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleRegenerateCode(group.id)}
                      disabled={regeneratingCode === group.id}
                    >
                      <RefreshCw className={`w-4 h-4 ${regeneratingCode === group.id ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>

                  {/* Stats */}
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

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{Math.min(progress, 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>
                </motion.div>
              );
            })}

            {filteredGroups.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nenhum grupo encontrado.' : 'Nenhum grupo cadastrado.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGroupsPage;
