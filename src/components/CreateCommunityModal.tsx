import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Compass, TrendingUp, Users, Lightbulb, Upload } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';
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
  const { user } = useAuthContext();
  const { uploadCommunityImage, uploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Travel');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    const url = await uploadCommunityImage(file, user.id);
    if (url) {
      setImageUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category,
        image_url: imageUrl || undefined,
      });
      // Reset form
      setName('');
      setDescription('');
      setCategory('Travel');
      setImageUrl('');
      setImagePreview(null);
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

  const displayImage = imagePreview || imageUrl;

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
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>{t('coverImage') || 'Cover Image'}</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-border bg-secondary/50 hover:bg-secondary/80 transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden relative"
                >
                  {displayImage ? (
                    <>
                      <img 
                        src={displayImage} 
                        alt="Preview" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="text-white text-sm font-medium flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          {t('changeImage') || 'Change image'}
                        </div>
                      </div>
                    </>
                  ) : uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {t('uploadImage') || 'Upload image'}
                      </span>
                    </>
                  )}
                </button>
              </div>

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

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || uploading || !name.trim()}
                className="w-full btn-primary"
              >
                {(loading || uploading) ? (
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
