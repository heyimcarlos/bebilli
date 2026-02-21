import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Search, Users, MessageCircle, Loader2, Check, Plus, Car, Home, GraduationCap, Laptop, Heart, TrendingUp, Shield, Sunset, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCommunities, Community } from '@/hooks/useCommunities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CommunityDetailPage from './CommunityDetailPage';
import CreateCommunityModal from '@/components/CreateCommunityModal';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Travel: Compass, Vehicle: Car, 'Real Estate': Home, Education: GraduationCap,
  Technology: Laptop, Health: Heart, Investment: TrendingUp, Emergency: Shield,
  Wedding: Heart, Retirement: Sunset, Family: Users, Hobby: Sparkles,
  Business: TrendingUp, Fashion: Sparkles, Sports: Heart, Entertainment: Sparkles,
  Pets: Heart, Food: Sparkles, Art: Sparkles, Music: Sparkles,
};

const ExplorePage: React.FC = () => {
  const { t } = useApp();
  const { user } = useAuthContext();
  const { communities, loading, createCommunity, joinCommunity, leaveCommunity, refreshCommunities } = useCommunities(user?.id);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Split communities
  const myCommunities = useMemo(() => communities.filter(c => c.is_member), [communities]);
  const otherCommunities = useMemo(() => communities.filter(c => !c.is_member), [communities]);

  // Group others by category
  const categorizedOthers = useMemo(() => {
    const map: Record<string, Community[]> = {};
    otherCommunities.forEach(c => {
      const cat = c.category || 'Other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(c);
    });
    // Sort categories by count desc
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [otherCommunities]);

  // Search filter
  const matchesSearch = (c: Community) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.description?.toLowerCase().includes(q) ?? false);
  };

  const filteredMy = useMemo(() => myCommunities.filter(matchesSearch), [myCommunities, searchQuery]);
  const filteredCategorized = useMemo(() =>
    categorizedOthers
      .map(([cat, list]) => [cat, list.filter(matchesSearch)] as [string, Community[]])
      .filter(([, list]) => list.length > 0),
    [categorizedOthers, searchQuery]
  );

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const handleJoinOrEnter = async (community: Community) => {
    if (community.is_member) {
      setSelectedCommunity(community);
    } else {
      setJoiningId(community.id);
      const { error } = await joinCommunity(community.id);
      setJoiningId(null);
      if (error) {
        toast({ title: t('error'), description: error.message, variant: 'destructive' });
      } else {
        toast({
          title: '🎉 ' + (t('joinedCommunity') || 'Joined!'),
          description: `${t('welcomeTo') || 'Welcome to'} ${community.name}!`,
        });
        await refreshCommunities();
        setSelectedCommunity({ ...community, is_member: true });
      }
    }
  };

  const handleLeaveCommunity = async () => {
    if (!selectedCommunity) return;
    const { error } = await leaveCommunity(selectedCommunity.id);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: t('leftCommunity') || 'Left community',
        description: `${t('youLeft') || 'You left'} ${selectedCommunity.name}`,
      });
      setSelectedCommunity(null);
    }
  };

  const handleCreateCommunity = async (data: { name: string; description: string; category: string; image_url?: string }) => {
    const { error } = await createCommunity(data);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: '🎉 ' + (t('communityCreated') || 'Community created!'),
        description: `${data.name} ${t('isNowAvailable') || 'is now available'}`,
      });
    }
  };

  if (selectedCommunity) {
    return (
      <CommunityDetailPage
        community={selectedCommunity}
        onBack={() => { setSelectedCommunity(null); refreshCommunities(); }}
        onLeave={handleLeaveCommunity}
      />
    );
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{t('exploreCommunities')}</h1>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="sm" className="btn-primary">
            <Plus className="w-4 h-4 mr-1" />
            {t('create')}
          </Button>
        </div>
        <p className="text-muted-foreground text-sm ml-13">{t('exploreDescription')}</p>
      </div>

      {/* Search */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t('searchCommunities')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* ── My Communities Feed ── */}
          <div className="px-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              {t('myCommunities') || 'My Communities'}
            </h2>

            {filteredMy.length === 0 ? (
              <motion.div
                className="glass-card p-6 text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-1 text-sm">{t('noCommunitiesYet') || 'No communities yet'}</h3>
                <p className="text-xs text-muted-foreground">{t('joinCommunityPrompt') || 'Explore categories below and join one!'}</p>
              </motion.div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="grid gap-3">
                {filteredMy.map((community) => (
                  <motion.div key={community.id} variants={item}>
                    <div
                      onClick={() => setSelectedCommunity(community)}
                      className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-primary/40 transition-colors active:scale-[0.98]"
                    >
                      <img
                        src={community.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200'}
                        alt={community.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">{community.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{community.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {community.members_count}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                            {community.category}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* ── Explore by Category ── */}
          <div className="px-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              {t('exploreByCategory') || 'Explore by Category'}
            </h2>

            {filteredCategorized.length === 0 ? (
              <motion.div
                className="glass-card p-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t('noCommunitiesFound')}</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredCategorized.map(([category, list]) => {
                  const isExpanded = expandedCategories.has(category);
                  const Icon = CATEGORY_ICONS[category] || Sparkles;
                  return (
                    <div key={category} className="glass-card overflow-hidden">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{category}</h3>
                            <p className="text-xs text-muted-foreground">
                              {list.length} {list.length === 1 ? (t('community') || 'community') : (t('communitiesCount') || 'communities')}
                            </p>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      </button>

                      {/* Expanded Community List */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3">
                              {list.map((community) => (
                                <div key={community.id} className="rounded-xl border border-border bg-background/50 overflow-hidden">
                                  <div className="relative h-32">
                                    <img
                                      src={community.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800'}
                                      alt={community.name}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                                  </div>
                                  <div className="p-3 -mt-6 relative">
                                    <h4 className="font-bold text-foreground mb-0.5">{community.name}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{community.description}</p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {community.members_count.toLocaleString()} {t('members')}
                                      </span>
                                      <Button
                                        onClick={() => handleJoinOrEnter(community)}
                                        size="sm"
                                        disabled={joiningId === community.id}
                                        className="btn-primary text-primary-foreground font-semibold px-4 h-8 text-xs"
                                      >
                                        {joiningId === community.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          t('join')
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <CreateCommunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCommunity}
      />
    </div>
  );
};

export default ExplorePage;
