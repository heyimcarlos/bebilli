

## Plan: Live Exchange Rates with CAD as Base Currency

### Changes — Single file: `src/contexts/AppContext.tsx`

**1. Add state + fetch logic inside `AppProvider`:**
- New state: `rates: Record<Currency, number>` initialized with fallback `{ CAD: 1, USD: 0.74, BRL: 3.70, EUR: 0.68 }`
- `useEffect` on mount: fetch `https://api.frankfurter.app/latest?from=CAD&to=USD,BRL,EUR`
- On success: update `rates` with `{ CAD: 1, ...response.rates }`
- On failure: keep fallback silently

**2. Update `formatCurrency` to convert:**
```ts
const formatCurrency = (value: number): string => {
  const converted = value * (rates[currency] || 1);
  // ... format with locale + symbol as before
};
```
All DB values are stored in CAD. When user selects EUR, multiply by live rate.

**3. Update `formatPremiumPrice`:** Same logic — use live `rates` instead of hardcoded `currencyRates`.

**4. Remove hardcoded `currencyRates` constant** (line ~2911). Keep `currencySymbols` and `currencyDecimals`.

**5. Expose `rates` in context** for components like receipt validation that need raw rates.

### Interface update
Add `rates: Record<Currency, number>` to `AppContextType`.

### Error handling
- API failure: silent catch, fallback rates used
- Loading: fallback rates render immediately, live rates trigger re-render when ready

### Files to modify
1. `src/contexts/AppContext.tsx`

