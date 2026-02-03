import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (
    file: File, 
    userId: string, 
    bucket: 'group-images' | 'avatars' | 'community-images'
  ): Promise<string | null> => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadGroupImage = async (file: File, userId: string) => {
    return uploadImage(file, userId, 'group-images');
  };

  const uploadAvatar = async (file: File, userId: string) => {
    return uploadImage(file, userId, 'avatars');
  };

  const uploadCommunityImage = async (file: File, userId: string) => {
    return uploadImage(file, userId, 'community-images');
  };

  return {
    uploadGroupImage,
    uploadAvatar,
    uploadCommunityImage,
    uploading,
  };
};
