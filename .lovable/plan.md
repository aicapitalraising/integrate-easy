

## Plan: Auto-Generate All Copy After Onboarding + Inline Editing

### What This Does

When a client completes onboarding, the system will automatically kick off sequential generation of all 9 asset types (Research → Angles → Emails → SMS → Ad Copy → Scripts → Creatives → Report → Funnel). The fulfillment workspace will show real-time progress, and all generated content will be editable inline.

### Changes

**1. Update `generate-asset` edge function prompts**
- Replace existing system prompts with the detailed prompt templates you provided (the exact copy rules, ad copy structure with 6 angles, funnel scheduler + thank you page structure, 10-email nurture sequence, 9-SMS sequence, VSL + 5 ad scripts + 5 objection videos, AI setter prompt)
- Ensure all prompts use the exact formatting rules: double-spaced lines, ✅ bullets, Dan Kennedy style, SEC/FINRA compliance, mandatory disclaimers
- Add a new `setter` asset type for the AI Setter prompt generation

**2. Auto-generate all assets after onboarding**
- In `Onboarding.tsx`, after the client record is saved successfully, trigger an automatic sequential generation flow by calling a new edge function `auto-generate-assets`
- This edge function will: generate Research first (with Google Search grounding), then Angles (using research), then all downstream assets (emails, sms, adcopy, scripts, creatives, report, funnel, setter) in sequence — each using the prior research + angles context
- Show a progress screen to the user after submission ("Generating your campaign assets... Research ✅ → Angles ⏳ → Emails...")

**3. Add inline editing to all generated content**
- Update `AssetGeneratorTab.tsx` to support an "Edit" mode toggle
- When editing, each content field renders as a `<Textarea>` pre-filled with the current value
- Add a "Save" button that updates the `client_assets` row's `content` JSON via Supabase
- This lets the team tweak any generated copy (headlines, email bodies, SMS messages, ad copy, scripts) without regenerating

**4. Add AI Setter tab to fulfillment workspace**
- New asset type `setter` in the fulfillment tabs
- Generates the AI setter prompt, FAQ responses, and follow-up sequences based on client data
- Renderer displays the setter intro message, rules, FAQ, and follow-up cadence

**5. Add "Generate All" button to fulfillment workspace**
- In `ClientWorkspace`, add a "Generate All Assets" button that triggers sequential generation of all 9 asset types
- Show progress indicator as each asset completes
- Useful for re-generating everything or for clients who onboarded before this feature

### Technical Details

- **New edge function**: `auto-generate-assets` — accepts `client_id`, fetches client data, then calls `generate-asset` internally for each asset type in dependency order
- **Database**: No schema changes needed — uses existing `client_assets` table
- **Editing**: Content is stored as JSONB; edits update specific keys within the JSON object, then save the whole object back
- **Progress tracking**: Use Supabase realtime on `client_assets` table to show live generation status in the UI

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/generate-asset/index.ts` | Update all system prompts with provided templates; add `setter` type |
| `supabase/functions/auto-generate-assets/index.ts` | New — orchestrates sequential generation of all asset types |
| `src/pages/Onboarding.tsx` | Call auto-generate after successful submission |
| `src/components/fulfillment/AssetGeneratorTab.tsx` | Add edit mode toggle, inline textarea editing, save functionality |
| `src/components/fulfillment/renderers.tsx` | Add `SetterRenderer`; update all renderers to support edit mode via props |
| `src/pages/Fulfillment.tsx` | Add Setter tab, "Generate All" button, generation progress UI |

