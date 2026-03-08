import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Clock, FileText, Loader2, ZoomIn, Check, X, XCircle, ArrowRightLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface ReceiptValidation {
  id: string;
  contribution_id: string;
  user_id: string;
  declared_amount: number;
  extracted_amount: number | null;
  extracted_date: string | null;
  extracted_type: string | null;
  validation_status: string;
  amount_match: boolean | null;
  tolerance_percent: number;
  created_at: string;
  receipt_image_url: string | null;
  extracted_currency?: string | null;
  converted_amount?: number | null;
  exchange_rate?: number | null;
}

interface ReceiptValidationHistoryProps {
  groupId: string;
}

const ReceiptValidationHistory: React.FC<ReceiptValidationHistoryProps> = ({ groupId }) => {
  const { t, formatCurrency, currency } = useApp();
  const { user } = useAuthContext();
  const [validations, setValidations] = useState<ReceiptValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedValidation, setSelectedValidation] = useState<ReceiptValidation | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchValidations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('receipt_validations')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setValidations(data);
      }
      setLoading(false);
    };

    fetchValidations();
  }, [groupId]);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    setUpdatingId(id);
    const previous = validations;

    setValidations(prev =>
      prev.map(v => v.id === id ? { ...v, validation_status: newStatus } : v)
    );

    const { error } = await supabase
      .from('receipt_validations')
      .update({ validation_status: newStatus })
      .eq('id', id);

    if (error) {
      setValidations(previous);
      toast({ title: '❌ Error', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: newStatus === 'approved' ? '✅ Approved' : '❌ Rejected',
        description: newStatus === 'approved'
          ? (t('receiptApprovedMsg') || 'Receipt has been approved.')
          : (t('receiptRejectedMsg') || 'Receipt has been rejected.'),
      });
      // Update the selected validation too
      setSelectedValidation(prev => prev?.id === id ? { ...prev, validation_status: newStatus } : prev);
    }
    setUpdatingId(null);
  };

  const getStatusDot = (status: string) => {
    if (status === 'approved') return 'bg-green-500';
    if (status === 'rejected') return 'bg-destructive';
    if (status === 'flagged') return 'bg-amber-500';
    return 'bg-muted-foreground';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'approved') return t('approved') || 'Approved';
    if (status === 'rejected') return t('rejected') || 'Rejected';
    if (status === 'flagged') return t('flagged') || 'Flagged';
    return t('pending') || 'Pending';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-[10px]">
          <ShieldCheck className="w-3 h-3 mr-1" />
          {t('approved') || 'Approved'}
        </Badge>
      );
    }
    if (status === 'rejected') {
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">
          <XCircle className="w-3 h-3 mr-1" />
          {t('rejected') || 'Rejected'}
        </Badge>
      );
    }
    if (status === 'flagged') {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {t('flagged') || 'Flagged'}
        </Badge>
      );
    }
    return (
      <Badge className="bg-muted text-muted-foreground text-[10px]">
        <Clock className="w-3 h-3 mr-1" />
        {t('pending') || 'Pending'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (validations.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">{t('noValidationsYet') || 'No receipt validations yet'}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{t('noValidationsDesc') || 'Receipts scanned via the scanner will appear here'}</p>
      </div>
    );
  }

  const v = selectedValidation;
  const canReview = v && (v.validation_status === 'pending' || v.validation_status === 'flagged') && v.user_id !== user?.id;

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">{t('validationHistory') || 'Validation History'}</h3>
        <Badge variant="outline" className="text-[10px] ml-auto">{validations.length}</Badge>
      </div>

      {/* Compact list */}
      <div className="space-y-1">
        {validations.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedValidation(item)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
          >
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getStatusDot(item.validation_status)}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{formatCurrency(item.declared_amount)}</p>
              <p className="text-[10px] text-muted-foreground">{getStatusLabel(item.validation_status)}</p>
            </div>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedValidation} onOpenChange={(open) => !open && setSelectedValidation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4" />
              {t('receiptDetails') || 'Receipt Details'}
            </DialogTitle>
          </DialogHeader>

          {v && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                {getStatusBadge(v.validation_status)}
                {v.extracted_type && (
                  <span className="text-[10px] text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded-full">
                    {v.extracted_type}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {new Date(v.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="glass-card p-3">
                  <p className="text-muted-foreground mb-1">{t('declared') || 'Declared'}</p>
                  <p className="font-semibold text-sm">{formatCurrency(v.declared_amount)}</p>
                </div>
                <div className="glass-card p-3">
                  <p className="text-muted-foreground mb-1">{t('extracted') || 'Extracted'}</p>
                  {(() => {
                    const isForeign = v.extracted_currency && v.extracted_currency !== currency;
                    const matchColor = v.amount_match === false ? 'text-amber-500' : v.amount_match === true ? 'text-green-500' : '';

                    if (isForeign && v.extracted_amount != null) {
                      return (
                        <div className="flex flex-col gap-0.5">
                          <p className="font-semibold text-sm text-muted-foreground">
                            {v.extracted_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="ml-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded-full">{v.extracted_currency}</span>
                          </p>
                          {v.converted_amount != null && (
                            <p className={`font-semibold text-sm flex items-center gap-1 ${matchColor}`}>
                              <ArrowRightLeft className="w-3 h-3 flex-shrink-0" />
                              {formatCurrency(v.converted_amount)}
                            </p>
                          )}
                          {v.exchange_rate != null && (
                            <p className="text-[9px] text-muted-foreground">Rate: {v.exchange_rate}</p>
                          )}
                        </div>
                      );
                    }

                    return (
                      <p className={`font-semibold text-sm ${matchColor}`}>
                        {v.extracted_amount != null ? formatCurrency(v.extracted_amount) : '—'}
                      </p>
                    );
                  })()}
                </div>
              </div>

              {v.extracted_date && (
                <p className="text-[11px] text-muted-foreground">
                  {t('receiptDate') || 'Receipt date'}: {v.extracted_date}
                </p>
              )}

              {/* Receipt image */}
              {v.receipt_image_url && (
                <button
                  onClick={() => setSelectedImage(v.receipt_image_url)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-xs text-muted-foreground group"
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border border-border">
                    <img src={v.receipt_image_url} alt="Receipt" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <span className="flex-1 text-left">{t('viewReceipt') || 'View receipt'}</span>
                  <ZoomIn className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}

              {/* Flagged warning */}
              {v.validation_status === 'flagged' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-600">
                  ⚠️ {t('flaggedWarning') || 'Amount mismatch detected. Requires group review.'}
                </div>
              )}

              {/* Approve / Reject */}
              {canReview && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1 h-9 text-xs bg-green-600 hover:bg-green-700 text-white"
                    disabled={updatingId === v.id}
                    onClick={() => handleUpdateStatus(v.id, 'approved')}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {t('approve') || 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 h-9 text-xs text-destructive hover:bg-destructive/10"
                    disabled={updatingId === v.id}
                    onClick={() => handleUpdateStatus(v.id, 'rejected')}
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    {t('reject') || 'Reject'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full-screen image viewer */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 bg-background/95 backdrop-blur-sm border-border">
          <div className="relative flex items-center justify-center min-h-[50vh]">
            {selectedImage && (
              <img src={selectedImage} alt="Receipt" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptValidationHistory;
