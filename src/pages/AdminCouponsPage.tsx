import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Tag, Trash2, Copy, Check, Loader2, Percent, DollarSign, Calendar, Users, ToggleLeft, ToggleRight, Crown, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminCouponsPageProps {
  onBack: () => void;
}

interface SubscriptionCoupon {
  id: string;
  code: string;
  description: string | null;
  discount_percentage: number | null;
  discount_amount: number | null;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

interface PartnerCoupon {
  id: string;
  partner_id: string;
  code: string;
  description: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  min_level: number;
  min_group_progress: number;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  premium_only: boolean;
}

interface Partner {
  id: string;
  name: string;
}

const AdminCouponsPage: React.FC<AdminCouponsPageProps> = ({ onBack }) => {
  const { t } = useApp();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [subCoupons, setSubCoupons] = useState<SubscriptionCoupon[]>([]);
  const [partnerCoupons, setPartnerCoupons] = useState<PartnerCoupon[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('premium');

  // Premium coupon form
  const [showPremiumForm, setShowPremiumForm] = useState(false);
  const [premiumForm, setPremiumForm] = useState({
    code: '', description: '', discountType: 'percentage' as 'percentage' | 'amount',
    discountValue: '', maxUses: '', validUntil: '',
  });

  // Partner coupon form
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    code: '', description: '', discountType: 'percentage' as 'percentage' | 'amount',
    discountValue: '', maxUses: '', validUntil: '', partnerId: '', minLevel: '1',
    minProgress: '0', premiumOnly: false,
  });

  const fetchData = async () => {
    setLoading(true);
    const [subRes, partnerRes, partnersRes] = await Promise.all([
      supabase.from('subscription_coupons').select('*').order('created_at', { ascending: false }),
      supabase.from('partner_coupons').select('*').order('created_at', { ascending: false }),
      supabase.from('partners').select('id, name').eq('is_active', true),
    ]);
    if (subRes.data) setSubCoupons(subRes.data);
    if (partnerRes.data) setPartnerCoupons(partnerRes.data);
    if (partnersRes.data) setPartners(partnersRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const generateRandomCode = (prefix: string, setter: (fn: (prev: any) => any) => void) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setter((prev: any) => ({ ...prev, code }));
  };

  const handleCreatePremiumCoupon = async () => {
    if (!premiumForm.code || !premiumForm.discountValue) {
      toast({ title: t('error'), description: t('fillRequiredFields'), variant: 'destructive' });
      return;
    }
    setCreating(true);
    const data: Record<string, unknown> = {
      code: premiumForm.code.toUpperCase(),
      description: premiumForm.description || null,
      created_by: user?.id,
    };
    if (premiumForm.discountType === 'percentage') data.discount_percentage = parseInt(premiumForm.discountValue);
    else data.discount_amount = parseFloat(premiumForm.discountValue);
    if (premiumForm.maxUses) data.max_uses = parseInt(premiumForm.maxUses);
    if (premiumForm.validUntil) data.valid_until = new Date(premiumForm.validUntil).toISOString();

    const { error } = await supabase.from('subscription_coupons').insert([data as any]);
    setCreating(false);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '🎉 ' + t('couponCreated'), description: t('couponCreatedDesc') });
      setShowPremiumForm(false);
      setPremiumForm({ code: '', description: '', discountType: 'percentage', discountValue: '', maxUses: '', validUntil: '' });
      fetchData();
    }
  };

  const handleCreatePartnerCoupon = async () => {
    if (!partnerForm.code || !partnerForm.discountValue || !partnerForm.partnerId || !partnerForm.description) {
      toast({ title: t('error'), description: t('fillRequiredFields'), variant: 'destructive' });
      return;
    }
    setCreating(true);
    const data: Record<string, unknown> = {
      code: partnerForm.code.toUpperCase(),
      description: partnerForm.description,
      partner_id: partnerForm.partnerId,
      min_level: parseInt(partnerForm.minLevel) || 1,
      min_group_progress: parseInt(partnerForm.minProgress) || 0,
      premium_only: partnerForm.premiumOnly,
    };
    if (partnerForm.discountType === 'percentage') data.discount_percentage = parseInt(partnerForm.discountValue);
    else data.discount_amount = parseFloat(partnerForm.discountValue);
    if (partnerForm.maxUses) data.max_uses = parseInt(partnerForm.maxUses);
    if (partnerForm.validUntil) data.valid_until = new Date(partnerForm.validUntil).toISOString();

    const { error } = await supabase.from('partner_coupons').insert([data as any]);
    setCreating(false);
    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '🎉 ' + t('couponCreated'), description: t('couponCreatedDesc') });
      setShowPartnerForm(false);
      setPartnerForm({ code: '', description: '', discountType: 'percentage', discountValue: '', maxUses: '', validUntil: '', partnerId: '', minLevel: '1', minProgress: '0', premiumOnly: false });
      fetchData();
    }
  };

  const toggleSubCoupon = async (c: SubscriptionCoupon) => {
    const { error } = await supabase.from('subscription_coupons').update({ is_active: !c.is_active }).eq('id', c.id);
    if (!error) { setSubCoupons(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x)); toast({ title: c.is_active ? '🔴 ' + t('couponDeactivated') : '🟢 ' + t('couponActivated') }); }
  };

  const togglePartnerCoupon = async (c: PartnerCoupon) => {
    const { error } = await supabase.from('partner_coupons').update({ is_active: !c.is_active }).eq('id', c.id);
    if (!error) { setPartnerCoupons(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x)); toast({ title: c.is_active ? '🔴 ' + t('couponDeactivated') : '🟢 ' + t('couponActivated') }); }
  };

  const deleteSubCoupon = async (id: string) => {
    const { error } = await supabase.from('subscription_coupons').delete().eq('id', id);
    if (!error) { setSubCoupons(prev => prev.filter(c => c.id !== id)); toast({ title: '🗑️ ' + t('couponDeleted') }); }
  };

  const deletePartnerCoupon = async (id: string) => {
    const { error } = await supabase.from('partner_coupons').delete().eq('id', id);
    if (!error) { setPartnerCoupons(prev => prev.filter(c => c.id !== id)); toast({ title: '🗑️ ' + t('couponDeleted') }); }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderCouponForm = (type: 'premium' | 'partner') => {
    const form = type === 'premium' ? premiumForm : partnerForm;
    const setForm = type === 'premium' ? setPremiumForm : setPartnerForm;
    const onSubmit = type === 'premium' ? handleCreatePremiumCoupon : handleCreatePartnerCoupon;
    const onClose = () => type === 'premium' ? setShowPremiumForm(false) : setShowPartnerForm(false);

    return (
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t('createNewCoupon')} - {type === 'premium' ? t('premiumCoupons') : t('partnerCoupons')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {type === 'partner' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('selectPartner')} *</label>
                <Select value={(form as typeof partnerForm).partnerId} onValueChange={(v) => (setForm as typeof setPartnerForm)(prev => ({ ...prev, partnerId: v }))}>
                  <SelectTrigger className="bg-secondary"><SelectValue placeholder={t('selectPartner')} /></SelectTrigger>
                  <SelectContent>
                    {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('couponCode')} *</label>
                <div className="flex gap-2">
                  <Input value={form.code} onChange={(e) => setForm((prev: any) => ({ ...prev, code: e.target.value.toUpperCase() }))} placeholder="BILLI20" className="uppercase" maxLength={20} />
                  <Button variant="outline" onClick={() => generateRandomCode(type === 'premium' ? 'BILLI' : 'DEAL', setForm)} type="button">{t('generate')}</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('description')} {type === 'partner' ? '*' : ''}</label>
                <Input value={form.description} onChange={(e) => setForm((prev: any) => ({ ...prev, description: e.target.value }))} placeholder={type === 'premium' ? 'Welcome discount' : '10% off at partner'} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('discountType')} *</label>
                <div className="flex gap-2">
                  <Button type="button" variant={form.discountType === 'percentage' ? 'default' : 'outline'} onClick={() => setForm((prev: any) => ({ ...prev, discountType: 'percentage' }))} className="flex-1 gap-2">
                    <Percent className="w-4 h-4" /> {t('percentage')}
                  </Button>
                  <Button type="button" variant={form.discountType === 'amount' ? 'default' : 'outline'} onClick={() => setForm((prev: any) => ({ ...prev, discountType: 'amount' }))} className="flex-1 gap-2">
                    <DollarSign className="w-4 h-4" /> {t('fixedAmount')}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{form.discountType === 'percentage' ? t('discountPercent') : t('discountAmount')} *</label>
                <Input type="number" value={form.discountValue} onChange={(e) => setForm((prev: any) => ({ ...prev, discountValue: e.target.value }))} placeholder={form.discountType === 'percentage' ? '20' : '2.00'} min={form.discountType === 'percentage' ? 1 : 0.01} max={form.discountType === 'percentage' ? 100 : undefined} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('maxUses')} ({t('optional')})</label>
                <Input type="number" value={form.maxUses} onChange={(e) => setForm((prev: any) => ({ ...prev, maxUses: e.target.value }))} placeholder="100" min={1} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('validUntil')} ({t('optional')})</label>
                <Input type="date" value={form.validUntil} onChange={(e) => setForm((prev: any) => ({ ...prev, validUntil: e.target.value }))} />
              </div>
            </div>

            {type === 'partner' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('minLevel')}</label>
                    <Input type="number" value={(form as typeof partnerForm).minLevel} onChange={(e) => (setForm as typeof setPartnerForm)(prev => ({ ...prev, minLevel: e.target.value }))} placeholder="1" min={1} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('minProgress')}</label>
                    <Input type="number" value={(form as typeof partnerForm).minProgress} onChange={(e) => (setForm as typeof setPartnerForm)(prev => ({ ...prev, minProgress: e.target.value }))} placeholder="0" min={0} max={100} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={(form as typeof partnerForm).premiumOnly} onCheckedChange={(v) => (setForm as typeof setPartnerForm)(prev => ({ ...prev, premiumOnly: v }))} />
                  <Label>{t('premiumOnly')}</Label>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">{t('cancel')}</Button>
              <Button onClick={onSubmit} disabled={creating} className="flex-1 gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {t('createCoupon')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderCouponCard = (coupon: { id: string; code: string; description: string | null; discount_percentage: number | null; discount_amount: number | null; is_active: boolean; current_uses: number; max_uses: number | null; valid_until: string | null }, onToggle: () => void, onDelete: () => void, index: number, extra?: React.ReactNode) => (
    <motion.div key={coupon.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className={!coupon.is_active ? 'opacity-60' : ''}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${coupon.discount_percentage ? 'bg-primary/10' : 'bg-green-500/10'}`}>
              {coupon.discount_percentage ? <Percent className="w-6 h-6 text-primary" /> : <DollarSign className="w-6 h-6 text-green-500" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{coupon.code}</h3>
                <button onClick={() => copyCode(coupon.code, coupon.id)} className="p-1 rounded hover:bg-secondary transition-colors">
                  {copiedId === coupon.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
                {!coupon.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{t('inactive')}</span>}
                {extra}
              </div>
              <p className="text-sm text-muted-foreground">{coupon.description || t('noDescription')}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{coupon.discount_percentage ? `${coupon.discount_percentage}% OFF` : `$${coupon.discount_amount} OFF`}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''} {t('uses')}</span>
                {coupon.valid_until && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(coupon.valid_until).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onToggle}>
                {coupon.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 p-4 max-w-4xl mx-auto">
          <motion.button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{t('couponManager')}</h1>
            <p className="text-sm text-muted-foreground">{t('manageDiscountCoupons')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="premium" className="gap-2"><Crown className="w-4 h-4" />{t('premiumCoupons')}</TabsTrigger>
            <TabsTrigger value="partner" className="gap-2"><Gift className="w-4 h-4" />{t('partnerCoupons')}</TabsTrigger>
          </TabsList>

          {/* Premium Tab */}
          <TabsContent value="premium" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t('premiumCouponDesc')}</p>
              <Button onClick={() => setShowPremiumForm(true)} className="gap-2"><Plus className="w-4 h-4" />{t('newCoupon')}</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Tag className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{subCoupons.length}</p><p className="text-xs text-muted-foreground">{t('totalCoupons')}</p></div></div></CardContent></Card>
              <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center"><Check className="w-5 h-5 text-green-500" /></div><div><p className="text-2xl font-bold">{subCoupons.filter(c => c.is_active).length}</p><p className="text-xs text-muted-foreground">{t('activeCoupons')}</p></div></div></CardContent></Card>
              <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-amber-500" /></div><div><p className="text-2xl font-bold">{subCoupons.reduce((s, c) => s + c.current_uses, 0)}</p><p className="text-xs text-muted-foreground">{t('totalUses')}</p></div></div></CardContent></Card>
            </div>

            {showPremiumForm && renderCouponForm('premium')}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">{t('allCoupons')}</h2>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : subCoupons.length === 0 ? (
                <Card><CardContent className="py-12 text-center"><Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{t('noCouponsYet')}</p><Button className="mt-4" onClick={() => setShowPremiumForm(true)}><Plus className="w-4 h-4 mr-2" />{t('createFirstCoupon')}</Button></CardContent></Card>
              ) : subCoupons.map((c, i) => renderCouponCard(c, () => toggleSubCoupon(c), () => deleteSubCoupon(c.id), i))}
            </div>
          </TabsContent>

          {/* Partner Tab */}
          <TabsContent value="partner" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t('partnerCouponDesc')}</p>
              <Button onClick={() => setShowPartnerForm(true)} className="gap-2"><Plus className="w-4 h-4" />{t('newCoupon')}</Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Gift className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold">{partnerCoupons.length}</p><p className="text-xs text-muted-foreground">{t('totalCoupons')}</p></div></div></CardContent></Card>
              <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center"><Check className="w-5 h-5 text-green-500" /></div><div><p className="text-2xl font-bold">{partnerCoupons.filter(c => c.is_active).length}</p><p className="text-xs text-muted-foreground">{t('activeCoupons')}</p></div></div></CardContent></Card>
              <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center"><Users className="w-5 h-5 text-amber-500" /></div><div><p className="text-2xl font-bold">{partnerCoupons.reduce((s, c) => s + c.current_uses, 0)}</p><p className="text-xs text-muted-foreground">{t('totalUses')}</p></div></div></CardContent></Card>
            </div>

            {showPartnerForm && renderCouponForm('partner')}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">{t('allCoupons')}</h2>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : partnerCoupons.length === 0 ? (
                <Card><CardContent className="py-12 text-center"><Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{t('noCouponsYet')}</p><Button className="mt-4" onClick={() => setShowPartnerForm(true)}><Plus className="w-4 h-4 mr-2" />{t('createFirstCoupon')}</Button></CardContent></Card>
              ) : partnerCoupons.map((c, i) => renderCouponCard(
                c, () => togglePartnerCoupon(c), () => deletePartnerCoupon(c.id), i,
                c.premium_only ? <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1"><Crown className="w-3 h-3" />{t('premiumOnly')}</span> : undefined
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCouponsPage;
