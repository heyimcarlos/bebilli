import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Loader2, Check, Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DefaultAvatar from '@/components/DefaultAvatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
  level: number | null;
  followStatus: 'none' | 'pending' | 'accepted';
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ isOpen, onClose }) => {
  const { t } = useApp();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!query.trim() || !user) return;
    setLoading(true);

    const searchTerm = query.trim().toLowerCase().replace('@', '');

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url, level')
      .or(`username.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
      .neq('id', user.id)
      .limit(20);

    if (profiles && profiles.length > 0) {
      const ids = profiles.map(p => p.id);
      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id, status')
        .eq('follower_id', user.id)
        .in('following_id', ids);

      const followMap = new Map(
        (follows || []).map(f => [f.following_id, f.status as string])
      );

      setResults(
        profiles.map(p => ({
          ...p,
          followStatus: (followMap.get(p.id) as 'none' | 'pending' | 'accepted') || 'none',
        }))
      );
    } else {
      setResults([]);
    }

    setLoading(false);
  };

  const handleFollow = async (targetId: string) => {
    if (!user) return;
    setFollowingIds(prev => new Set(prev).add(targetId));

    const { error } = await supabase.from('user_follows').insert({
      follower_id: user.id,
      following_id: targetId,
      status: 'pending',
    });

    if (error) {
      setFollowingIds(prev => { const s = new Set(prev); s.delete(targetId); return s; });
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      setResults(prev =>
        prev.map(r => (r.id === targetId ? { ...r, followStatus: 'pending' as const } : r))
      );
      toast({ title: '✨', description: t('followRequestSent') });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            {t('searchUsers')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder={t('searchByUsername')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="bg-secondary"
          />
          <Button onClick={handleSearch} disabled={loading} size="sm" className="px-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          {results.map(user => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {user.avatar_url && !user.avatar_url.startsWith('avatar:') ? (
                  <img src={user.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <DefaultAvatar name={user.avatar_url?.replace('avatar:', '') || user.name} size={40} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                {user.username && <p className="text-xs text-muted-foreground">@{user.username}</p>}
                <p className="text-[10px] text-muted-foreground">LVL {user.level || 1}</p>
              </div>
              {user.followStatus === 'accepted' ? (
                <span className="text-xs text-success flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" /> {t('following')}
                </span>
              ) : user.followStatus === 'pending' || followingIds.has(user.id) ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {t('pending')}
                </span>
              ) : (
                <Button size="sm" className="h-8 px-3" onClick={() => handleFollow(user.id)}>
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  {t('follow')}
                </Button>
              )}
            </motion.div>
          ))}

          {!loading && results.length === 0 && query.trim() && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              {t('noUsersFound')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchModal;
