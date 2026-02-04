import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Trash2, Gift, Building2, Tag, Loader2, Save, X, Percent, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  category: string;
  is_active: boolean;
}

interface Coupon {
  id: string;
  partner_id: string;
  code: string;
  description: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  min_level: number;
  min_group_progress: number;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
}

const AdminPartnersPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);

  const categories = ['travel', 'food', 'shopping', 'entertainment', 'health', 'education', 'finance', 'technology'];

  const fetchData = async () => {
    setLoading(true);
    
    const [partnersRes, couponsRes] = await Promise.all([
      supabase.from('partners').select('*').order('name'),
      supabase.from('partner_coupons').select('*').order('created_at', { ascending: false })
    ]);

    if (partnersRes.data) setPartners(partnersRes.data);
    if (couponsRes.data) setCoupons(couponsRes.data);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSavePartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const partnerData = {
      name: formData.get('name') as string,
      logo_url: formData.get('logo_url') as string || null,
      description: formData.get('description') as string || null,
      website_url: formData.get('website_url') as string || null,
      category: formData.get('category') as string,
      is_active: formData.get('is_active') === 'on',
    };

    if (editingPartner) {
      const { error } = await supabase
        .from('partners')
        .update(partnerData)
        .eq('id', editingPartner.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Partner updated!' });
        setEditingPartner(null);
        setShowPartnerForm(false);
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('partners')
        .insert(partnerData);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Partner created!' });
        setShowPartnerForm(false);
        fetchData();
      }
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const couponData = {
      partner_id: formData.get('partner_id') as string,
      code: formData.get('code') as string,
      description: formData.get('description') as string,
      discount_percentage: formData.get('discount_percentage') ? Number(formData.get('discount_percentage')) : null,
      discount_amount: formData.get('discount_amount') ? Number(formData.get('discount_amount')) : null,
      min_level: Number(formData.get('min_level')) || 1,
      min_group_progress: Number(formData.get('min_group_progress')) || 0,
      valid_until: formData.get('valid_until') as string || null,
      max_uses: formData.get('max_uses') ? Number(formData.get('max_uses')) : null,
      is_active: formData.get('is_active') === 'on',
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from('partner_coupons')
        .update(couponData)
        .eq('id', editingCoupon.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Coupon updated!' });
        setEditingCoupon(null);
        setShowCouponForm(false);
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('partner_coupons')
        .insert(couponData);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Coupon created!' });
        setShowCouponForm(false);
        fetchData();
      }
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Delete this partner? This will also delete all associated coupons.')) return;
    
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Partner removed.' });
      fetchData();
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    
    const { error } = await supabase.from('partner_coupons').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Coupon removed.' });
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Partner & Coupon Admin</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="px-6">
          <Tabs defaultValue="partners">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="partners" className="flex-1">
                <Building2 className="w-4 h-4 mr-2" />
                Partners ({partners.length})
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex-1">
                <Gift className="w-4 h-4 mr-2" />
                Coupons ({coupons.length})
              </TabsTrigger>
            </TabsList>

            {/* Partners Tab */}
            <TabsContent value="partners">
              <Button
                onClick={() => { setShowPartnerForm(true); setEditingPartner(null); }}
                className="w-full mb-4 btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>

              {showPartnerForm && (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSavePartner}
                  className="glass-card p-4 mb-4 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{editingPartner ? 'Edit Partner' : 'New Partner'}</h3>
                    <Button type="button" variant="ghost" size="icon" onClick={() => { setShowPartnerForm(false); setEditingPartner(null); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input name="name" defaultValue={editingPartner?.name} required />
                    </div>
                    <div>
                      <Label htmlFor="logo_url">Logo URL</Label>
                      <Input name="logo_url" defaultValue={editingPartner?.logo_url || ''} />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea name="description" defaultValue={editingPartner?.description || ''} />
                    </div>
                    <div>
                      <Label htmlFor="website_url">Website URL</Label>
                      <Input name="website_url" defaultValue={editingPartner?.website_url || ''} />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" defaultValue={editingPartner?.category || 'general'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch name="is_active" defaultChecked={editingPartner?.is_active ?? true} />
                      <Label>Active</Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full btn-primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Partner
                  </Button>
                </motion.form>
              )}

              <div className="space-y-3">
                {partners.map(partner => (
                  <div key={partner.id} className="glass-card p-4 flex items-center gap-4">
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt={partner.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{partner.name}</h4>
                        {!partner.is_active && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Inactive</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{partner.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditingPartner(partner); setShowPartnerForm(true); }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePartner(partner.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Coupons Tab */}
            <TabsContent value="coupons">
              <Button
                onClick={() => { setShowCouponForm(true); setEditingCoupon(null); }}
                className="w-full mb-4 btn-primary"
                disabled={partners.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Coupon
              </Button>

              {partners.length === 0 && (
                <p className="text-center text-muted-foreground text-sm mb-4">
                  Add a partner first before creating coupons.
                </p>
              )}

              {showCouponForm && (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSaveCoupon}
                  className="glass-card p-4 mb-4 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{editingCoupon ? 'Edit Coupon' : 'New Coupon'}</h3>
                    <Button type="button" variant="ghost" size="icon" onClick={() => { setShowCouponForm(false); setEditingCoupon(null); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="partner_id">Partner *</Label>
                      <Select name="partner_id" defaultValue={editingCoupon?.partner_id}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select partner" />
                        </SelectTrigger>
                        <SelectContent>
                          {partners.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="code">Coupon Code *</Label>
                      <Input name="code" defaultValue={editingCoupon?.code} required className="uppercase" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Input name="description" defaultValue={editingCoupon?.description} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="discount_percentage">Discount %</Label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input name="discount_percentage" type="number" defaultValue={editingCoupon?.discount_percentage || ''} className="pl-10" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="discount_amount">Amount $</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input name="discount_amount" type="number" step="0.01" defaultValue={editingCoupon?.discount_amount || ''} className="pl-10" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min_level">Min Level</Label>
                        <Input name="min_level" type="number" defaultValue={editingCoupon?.min_level || 1} min={1} />
                      </div>
                      <div>
                        <Label htmlFor="min_group_progress">Min Progress %</Label>
                        <Input name="min_group_progress" type="number" defaultValue={editingCoupon?.min_group_progress || 0} min={0} max={100} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valid_until">Valid Until</Label>
                        <Input name="valid_until" type="date" defaultValue={editingCoupon?.valid_until?.split('T')[0] || ''} />
                      </div>
                      <div>
                        <Label htmlFor="max_uses">Max Uses</Label>
                        <Input name="max_uses" type="number" defaultValue={editingCoupon?.max_uses || ''} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch name="is_active" defaultChecked={editingCoupon?.is_active ?? true} />
                      <Label>Active</Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full btn-primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Coupon
                  </Button>
                </motion.form>
              )}

              <div className="space-y-3">
                {coupons.map(coupon => {
                  const partner = partners.find(p => p.id === coupon.partner_id);
                  return (
                    <div key={coupon.id} className="glass-card p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary">{coupon.code}</span>
                            {!coupon.is_active && (
                              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Inactive</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{partner?.name}</p>
                          <p className="text-sm">{coupon.description}</p>
                          <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                            {coupon.discount_percentage && <span>{coupon.discount_percentage}% off</span>}
                            {coupon.discount_amount && <span>${coupon.discount_amount} off</span>}
                            <span>• Level {coupon.min_level}+</span>
                            {coupon.min_group_progress > 0 && <span>• {coupon.min_group_progress}% progress</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingCoupon(coupon); setShowCouponForm(true); }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default AdminPartnersPage;
