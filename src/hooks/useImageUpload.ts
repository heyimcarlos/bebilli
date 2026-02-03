import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadGroupImage = async (file: File, userId: string): Promise<string | null> => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('group-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('group-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadGroupImage,
    uploading,
  };
};
