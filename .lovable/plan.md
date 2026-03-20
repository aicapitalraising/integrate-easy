

## Fix: Stripe import build error in edge function

**Problem**: The `create-payment` edge function uses `import Stripe from "npm:stripe@18.5.0"` which fails because there's no `deno.json` configured for npm module resolution.

**Solution**: Replace the `npm:` specifier with an `esm.sh` import, which is the standard approach for Supabase Edge Functions without a `deno.json`.

### Change

**File: `supabase/functions/create-payment/index.ts`** (line 2)

Replace:
```ts
import Stripe from "npm:stripe@18.5.0";
```
With:
```ts
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
```

This is a one-line fix. No other changes needed.

