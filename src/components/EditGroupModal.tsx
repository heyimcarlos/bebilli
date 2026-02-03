import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ImagePlus, X, Pencil } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  currentName: string;
  currentDescription: string | null;
  currentImageUrl: string | null;
  currentGoalAmount: number;
  onSave: (updates: { name?: string; description?: string; image_url?: string; goal_amount?: number }) => Promise<{ error: Error | null }>;
  userId: string;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  onClose,
  groupId,
  currentName,
  currentDescription,
  currentImageUrl,
  currentGoalAmount,
  onSave,
  userId,
}) => {
  const { t } = useApp();
  const { uploadGroupImage, uploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || '');
  const [goalAmount, setGoalAmount] = useState(currentGoalAmount.toString());
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(currentImageUrl);
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setDescription(currentDescription || '');
      setGoalAmount(currentGoalAmount.toString());
      setImagePreview(currentImageUrl);
      setSelectedImage(null);
    }
  }, [isOpen, currentName, currentDescription, currentGoalAmount, currentImageUrl]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(currentImageUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    let imageUrl: string | undefined;
    
    if (selectedImage) {
      const uploadedUrl = await uploadGroupImage(selectedImage, userId);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }
    
    const updates: { name?: string; description?: string; image_url?: string; goal_amount?: number } = {};
    
    if (name !== currentName) updates.name = name;
    if (description !== (currentDescription || '')) updates.description = description;
    if (imageUrl) updates.image_url = imageUrl;
    if (Number(goalAmount) !== currentGoalAmount) updates.goal_amount = Number(goalAmount);
    
    const { error } = await onSave(updates);
    setSaving(false);
    
    if (!error) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            {t('editGroup')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>{t('groupPhoto')}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-primary-foreground" />
                </button>
                {selectedImage && (
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                <ImagePlus className="w-8 h-8" />
                <span className="text-sm">{t('addPhotoForGroup')}</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('groupName')}</Label>
            <Input 
              placeholder={t('groupNamePlaceholder')} 
              className="bg-secondary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('goalAmount')} ($)</Label>
            <Input 
              type="number" 
              placeholder="50000" 
              className="bg-secondary"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('descriptionOptional')}</Label>
            <Textarea 
              placeholder={t('descriptionPlaceholder')} 
              className="bg-secondary resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <Button
            onClick={handleSave}
            disabled={saving || uploading || !name || !goalAmount}
            className="w-full btn-primary text-primary-foreground"
          >
            {saving || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupModal;
