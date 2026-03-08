import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Clock, FileText, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

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
}

interface ReceiptValidationHistoryProps {
  groupId: string;
}

const ReceiptValidationHistory: React.FC<ReceiptValidationHistoryProps> = ({ groupId }) => {
  const { t, formatCurrency } = useApp();
  const { user } = useAuthContext();
  const [validations, setValidations] = useState<ReceiptValidation[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = (status: string, match: boolean | null) => {
    if (status === 'approved') {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-[10px]">
          <ShieldCheck className="w-3 h-3 mr-1" />
          {t('approved') || 'Approved'}
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold">{t('validationHistory') || 'Validation History'}</h3>
        <Badge variant="outline" className="text-[10px] ml-auto">{validations.length}</Badge>
      </div>
      
      {validations.map((v, i) => (
        <motion.div
          key={v.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge(v.validation_status, v.amount_match)}
              {v.extracted_type && (
                <span className="text-[10px] text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded-full">
                  {v.extracted_type}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {new Date(v.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">{t('declared') || 'Declared'}</p>
              <p className="font-semibold">{formatCurrency(v.declared_amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('extracted') || 'Extracted'}</p>
              <p className={`font-semibold ${v.amount_match === false ? 'text-amber-500' : v.amount_match === true ? 'text-green-500' : ''}`}>
                {v.extracted_amount != null ? formatCurrency(v.extracted_amount) : '—'}
              </p>
            </div>
          </div>

          {v.extracted_date && (
            <p className="text-[10px] text-muted-foreground">
              {t('receiptDate') || 'Receipt date'}: {v.extracted_date}
            </p>
          )}

          {v.validation_status === 'flagged' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-xs text-amber-600">
              ⚠️ {t('flaggedWarning') || 'Amount mismatch detected. Requires group review.'}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ReceiptValidationHistory;
