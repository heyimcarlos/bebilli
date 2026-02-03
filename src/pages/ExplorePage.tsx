import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Search, Users, MessageCircle, Lightbulb, TrendingUp, Loader2, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCommunities, Community } from '@/hooks/useCommunities';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CommunityDetailPage from './CommunityDetailPage';

const ExplorePage: React.FC = () => {
  const { t } = useApp();
  const { user } = useAuthContext();
  const { communities, loading, joinCommunity, leaveCommunity, refreshCommunities } = useCommunities(user?.id);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Categories for filtering
  const categories = [
    { id: 'all', label: t('all'), icon: Compass },
    { id: 'Travel', label: t('travel'), icon: Compass },
    { id: 'Vehicle', label: t('vehicle'), icon: TrendingUp },
    { id: 'Real Estate', label: t('realEstate'), icon: Users },
    { id: 'Education', label: t('education'), icon: Lightbulb },
  ];

  // Filter communities
  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (community.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinOrEnter = async (community: Community) => {
    if (community.is_member) {
      setSelectedCommunity(community);
    } else {
      setJoiningId(community.id);
      const { error } = await joinCommunity(community.id);
      setJoiningId(null);

      if (error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '🎉 ' + (t('joinedCommunity') || 'Joined!'),
          description: `${t('welcomeTo') || 'Welcome to'} ${community.name}!`,
        });
        // Enter the community after joining
        await refreshCommunities();
        setSelectedCommunity({ ...community, is_member: true });
      }
    }
  };

  const handleLeaveCommunity = async () => {
    if (!selectedCommunity) return;

    const { error } = await leaveCommunity(selectedCommunity.id);

    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('leftCommunity') || 'Left community',
        description: `${t('youLeft') || 'You left'} ${selectedCommunity.name}`,
      });
      setSelectedCommunity(null);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Show community detail if selected
  if (selectedCommunity) {
    return (
      <CommunityDetailPage
        community={selectedCommunity}
        onBack={() => {
          setSelectedCommunity(null);
          refreshCommunities();
        }}
        onLeave={handleLeaveCommunity}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t('exploreCommunities')}</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-13">
          {t('exploreDescription')}
        </p>
      </div>

      {/* Search */}
      <div className="px-6 mb-4">
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

      {/* Categories */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id || (!selectedCategory && category.id === 'all') ? 'default' : 'outline'}
              className={`cursor-pointer whitespace-nowrap px-4 py-2 ${
                selectedCategory === category.id || (!selectedCategory && category.id === 'all')
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
              onClick={() => setSelectedCategory(category.id === 'all' ? null : category.id)}
            >
              <category.icon className="w-3 h-3 mr-1" />
              {category.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border-primary/30"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t('shareTipsTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('shareTipsDescription')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Communities Grid */}
      <div className="px-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          {t('popularCommunities')}
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCommunities.length === 0 ? (
          <motion.div 
            className="glass-card p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">{t('noCommunitiesFound')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('tryDifferentSearch')}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4"
          >
            {filteredCommunities.map((community) => (
              <motion.div key={community.id} variants={item}>
                <div className="glass-card overflow-hidden group">
                  <div className="relative h-40">
                    <img
                      src={community.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800'}
                      alt={community.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary backdrop-blur-sm border border-primary/30">
                        {community.category}
                      </span>
                    </div>
                    {community.is_member && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success backdrop-blur-sm border border-success/30 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {t('member') || 'Member'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 -mt-8 relative">
                    <h3 className="font-bold text-lg text-foreground mb-1">{community.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{community.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{community.members_count.toLocaleString()} {t('members')}</span>
                      </div>
                      
                      <Button
                        onClick={() => handleJoinOrEnter(community)}
                        size="sm"
                        disabled={joiningId === community.id}
                        className={community.is_member 
                          ? "bg-secondary text-foreground hover:bg-secondary/80 font-semibold px-4"
                          : "btn-primary text-primary-foreground font-semibold px-4"
                        }
                      >
                        {joiningId === community.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : community.is_member ? (
                          <>
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {t('enter') || 'Enter'}
                          </>
                        ) : (
                          t('join')
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
