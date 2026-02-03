import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Compass, TrendingUp, Users, Lightbulb } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; category: string; image_url?: string }) => Promise<void>;
}

const categories = [
  { id: 'Travel', icon: Compass },
  { id: 'Vehicle', icon: TrendingUp },
  { id: 'Real Estate', icon: Users },
  { id: 'Education', icon: Lightbulb },
];

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Travel');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category,
        image_url: imageUrl.trim() || undefined,
      });
      // Reset form
      setName('');
      setDescription('');
      setCategory('Travel');
      setImageUrl('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (id: string) => {
    switch (id) {
      case 'Travel': return t('travel');
      case 'Vehicle': return t('vehicle');
      case 'Real Estate': return t('realEstate');
      case 'Education': return t('education');
      default: return id;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg bg-card rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t('createCommunity')}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="community-name">{t('communityName')}</Label>
                <Input
                  id="community-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('communityNamePlaceholder')}
                  className="bg-secondary border-border"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="community-description">{t('description')}</Label>
                <Textarea
                  id="community-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('communityDescriptionPlaceholder')}
                  className="bg-secondary border-border min-h-[100px]"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>{t('category')}</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={category === cat.id ? 'default' : 'outline'}
                      className={`cursor-pointer px-4 py-2 ${
                        category === cat.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                      onClick={() => setCategory(cat.id)}
                    >
                      <cat.icon className="w-3 h-3 mr-1" />
                      {getCategoryLabel(cat.id)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="community-image">{t('imageUrlOptional')}</Label>
                <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    id="community-image"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full btn-primary"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {t('createCommunity')}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateCommunityModal;
