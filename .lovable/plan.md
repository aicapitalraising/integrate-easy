

## Plan: Add EIN Number and Card-on-File Fields to Onboarding Step 3

### What Changes

Add two new sections to the "Brand & Assets" step (Step 3) of the onboarding form:

1. **EIN Number field** — text input with label explaining it's needed for A2P approval to send SMS
2. **Card on File section** — card number, expiration date, and CVV fields with a clear notice: "Your card will not be charged. It is only being placed on file for your CRM and ad manager accounts."

### Technical Details

| File | Change |
|---|---|
| `src/pages/Onboarding.tsx` | Add state variables (`einNumber`, `cardNumber`, `cardExp`, `cardCvv`). Add two new UI sections between the investor list upload and brand notes fields. Include the fields in the submission payload to `clients` table. |
| Database migration | Add columns `ein_number`, `card_number`, `card_exp`, `card_cvv` (all nullable text) to the `clients` table. Card data stored as-is for internal use (not processed for payments). |

### Security Note
Card details will be stored in the database for the sole purpose of adding to CRM and Facebook Ad Manager on behalf of the client. A clear disclaimer will be shown on the form. The fields will use appropriate input masks (card number grouped in 4s, MM/YY for expiration, 3-4 digits for CVV).

