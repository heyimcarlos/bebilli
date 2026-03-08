

## Plan: Add Missing Translation Keys Across All 4 Languages

### Problem
Multiple components use `t('key') || 'fallback'` for translation keys that don't exist in the translations dictionary. This means non-English users see raw key names or English fallbacks instead of proper localized text.

### Missing Keys Identified

After cross-referencing component usage against `AppContext.tsx` translations, these keys are missing from all 4 languages (pt, en, fr, es):

| Key | Used In | Intended Meaning |
|-----|---------|-----------------|
| `pendingVerification` | GroupPage.tsx | Contribution awaiting group approval |
| `receiptDetails` | ReceiptValidationHistory.tsx | Receipt detail dialog title |
| `noCouponsAvailable` | PartnerCoupons.tsx | Empty state for partner coupons |
| `monthlySavings` | PremiumAnalytics.tsx | Monthly savings chart label |
| `recordAudio` | AudioRecorder.tsx | Record audio button tooltip |
| `rejected` | ReceiptValidationHistory.tsx | Receipt rejected status |
| `currentStreak` | StreakDisplay.tsx | Current streak label |
| `personalBest` | StreakDisplay.tsx | Personal best streak message |
| `nextLevel` | StreakDisplay.tsx | Next streak level label |
| `day` | StreakDisplay.tsx | Singular "day" |
| `receiptApprovedMsg` | ReceiptValidationHistory.tsx toast | "Receipt has been approved" |
| `receiptRejectedMsg` | ReceiptValidationHistory.tsx toast | "Receipt has been rejected" |

### Changes

**Single file: `src/contexts/AppContext.tsx`**

Add all missing keys to each of the 4 language blocks with short, polished, on-brand translations:

**Portuguese (pt):**
- `pendingVerification`: 'Aguardando verificação'
- `receiptDetails`: 'Detalhes do Comprovante'
- `noCouponsAvailable`: 'Nenhum cupom de parceiro disponível ainda'
- `monthlySavings`: 'Economia Mensal'
- `recordAudio`: 'Gravar áudio'
- `rejected`: 'Rejeitado'
- `currentStreak`: 'Streak Atual'
- `personalBest`: 'Você está no seu melhor!'
- `nextLevel`: 'Próximo nível'
- `day`: 'dia'

**English (en):**
- `pendingVerification`: 'Pending verification'
- `receiptDetails`: 'Receipt Details'
- `noCouponsAvailable`: 'No partner coupons available yet'
- `monthlySavings`: 'Monthly Savings'
- `recordAudio`: 'Record audio'
- `rejected`: 'Rejected'
- `currentStreak`: 'Current Streak'
- `personalBest`: "You're at your personal best!"
- `nextLevel`: 'Next level'
- `day`: 'day'

**French (fr):**
- `pendingVerification`: 'En attente de vérification'
- `receiptDetails`: 'Détails du Reçu'
- `noCouponsAvailable`: 'Aucun coupon partenaire disponible pour le moment'
- `monthlySavings`: 'Épargne Mensuelle'
- `recordAudio`: 'Enregistrer audio'
- `rejected`: 'Rejeté'
- `currentStreak`: 'Série Actuelle'
- `personalBest`: 'Vous êtes à votre meilleur!'
- `nextLevel`: 'Prochain niveau'
- `day`: 'jour'

**Spanish (es):**
- `pendingVerification`: 'Pendiente de verificación'
- `receiptDetails`: 'Detalles del Comprobante'
- `noCouponsAvailable`: 'No hay cupones de socios disponibles aún'
- `monthlySavings`: 'Ahorro Mensual'
- `recordAudio`: 'Grabar audio'
- `rejected`: 'Rechazado'
- `currentStreak`: 'Racha Actual'
- `personalBest`: '¡Estás en tu mejor momento!'
- `nextLevel`: 'Siguiente nivel'
- `day`: 'día'

### Files to modify
1. **`src/contexts/AppContext.tsx`** -- Add ~12 keys to each of the 4 language blocks (pt, en, fr, es)

