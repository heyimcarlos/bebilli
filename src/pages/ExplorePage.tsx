import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Search, Users, MessageCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import CommunityCard from '@/components/CommunityCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ExplorePageProps {
  onJoinCommunity?: (communityId: string) => void;
}

const ExplorePage: React.FC<ExplorePageProps> = ({ onJoinCommunity }) => {
  const { t, communities } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
                          community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoin = (communityId: string) => {
    onJoinCommunity?.(communityId);
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
        
        {filteredCommunities.length === 0 ? (
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
                <CommunityCard
                  id={community.id}
                  name={community.name}
                  description={community.description}
                  image={community.image}
                  members={community.members}
                  category={community.category}
                  onJoin={() => handleJoin(community.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
