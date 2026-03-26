import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo-aicra.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Target,
  Palette,
  Rocket,
  DollarSign,
  Users,
  Calendar,
  Globe,
  FileText,
  Upload,
  Phone,
  Clock,
  Video,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const steps = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'assets', label: 'Assets', icon: Palette },
  { id: 'kickoff', label: 'Kickoff', icon: Calendar },
  { id: 'review', label: 'Submit', icon: Rocket },
];

const fundTypes = [
  'Real Estate Fund',
  'Multifamily Syndication',
  'Single Family Fund',
  'Oil & Gas Fund',
  'Land Fund',
  'Private Equity',
  'Venture Capital',
  'Other',
];

const timelineOptions = ['60 days', '90 days', '6 months', '12 months'];


export default function Onboarding() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scraped, setScraped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      toast({ title: 'Payment successful!', description: 'Now complete your onboarding to get started.' });
    }
    // Resume from existing client
    const resumeId = searchParams.get('resume');
    if (resumeId && !clientId) {
      loadExistingClient(resumeId);
    }
  }, []);

  // Company
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [fundType, setFundType] = useState('');
  const [website, setWebsite] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [industryFocus, setIndustryFocus] = useState('');

  // Goals
  const [exactRaiseAmount, setExactRaiseAmount] = useState('');
  const [timeline, setTimeline] = useState('90 days');
  const [minInvestment, setMinInvestment] = useState('');
  const [targetInvestor, setTargetInvestor] = useState('');
  const [pitchDeckLink, setPitchDeckLink] = useState('');
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const [targetedReturns, setTargetedReturns] = useState('');
  const [holdPeriod, setHoldPeriod] = useState('');
  const [distributionSchedule, setDistributionSchedule] = useState('');
  const [investmentRange, setInvestmentRange] = useState('');
  const [taxAdvantages, setTaxAdvantages] = useState('');
  const [credibility, setCredibility] = useState('');
  const [fundHistory, setFundHistory] = useState('');

  // Assets
  const [budgetMode, setBudgetMode] = useState<'monthly' | 'daily'>('monthly');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [investorListFile, setInvestorListFile] = useState<File | null>(null);
  const [brandNotes, setBrandNotes] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [einNumber, setEinNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Team members
  const [teamMembers, setTeamMembers] = useState([{ name: '', email: '', phone: '', title: '' }]);

  const addTeamMember = () => setTeamMembers([...teamMembers, { name: '', email: '', phone: '', title: '' }]);
  const removeTeamMember = (index: number) => setTeamMembers(teamMembers.filter((_, i) => i !== index));
  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  // Kickoff booking
  const [kickoffBooked, setKickoffBooked] = useState(false);
  const [selectedKickoffDate, setSelectedKickoffDate] = useState('');
  const [selectedKickoffTime, setSelectedKickoffTime] = useState('');

  // Load existing client for resume
  const loadExistingClient = async (id: string) => {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
    if (error || !data) return;
    const c = data as any;
    setClientId(c.id);
    setCurrentStep(c.current_step || 0);
    if (c.company_name) setCompanyName(c.company_name);
    if (c.contact_name) setContactName(c.contact_name);
    if (c.contact_email) setContactEmail(c.contact_email);
    if (c.contact_phone) setContactPhone(c.contact_phone);
    if (c.fund_type) setFundType(c.fund_type);
    if (c.website) { setWebsite(c.website); setScraped(true); }
    if (c.speaker_name) setSpeakerName(c.speaker_name);
    if (c.industry_focus) setIndustryFocus(c.industry_focus);
    if (c.raise_amount) setExactRaiseAmount(c.raise_amount);
    if (c.timeline) setTimeline(c.timeline);
    if (c.min_investment) setMinInvestment(c.min_investment);
    if (c.target_investor) setTargetInvestor(c.target_investor);
    if (c.pitch_deck_link) setPitchDeckLink(c.pitch_deck_link);
    if (c.targeted_returns) setTargetedReturns(c.targeted_returns);
    if (c.hold_period) setHoldPeriod(c.hold_period);
    if (c.distribution_schedule) setDistributionSchedule(c.distribution_schedule);
    if (c.investment_range) setInvestmentRange(c.investment_range);
    if (c.tax_advantages) setTaxAdvantages(c.tax_advantages);
    if (c.credibility) setCredibility(c.credibility);
    if (c.fund_history) setFundHistory(c.fund_history);
    if (c.budget_mode) setBudgetMode(c.budget_mode as 'monthly' | 'daily');
    if (c.budget_amount) setBudgetAmount(c.budget_amount);
    if (c.brand_notes) setBrandNotes(c.brand_notes);
    if (c.additional_notes) setAdditionalNotes(c.additional_notes);
    if (c.ein_number) setEinNumber(c.ein_number);
    if (c.card_number) setCardNumber(c.card_number.replace(/(.{4})/g, '$1 ').trim());
    if (c.card_exp) setCardExp(c.card_exp);
    if (c.card_cvv) setCardCvv(c.card_cvv);
    if (c.kickoff_date) { setSelectedKickoffDate(c.kickoff_date); setKickoffBooked(true); }
    if (c.kickoff_time) setSelectedKickoffTime(c.kickoff_time);
    // Load team members
    const { data: members } = await supabase.from('team_members').select('*').eq('client_id', c.id);
    if (members && members.length > 0) {
      setTeamMembers(members.map((m: any) => ({ name: m.name || '', email: m.email || '', phone: m.phone || '', title: m.title || '' })));
    }
  };

  // Build the payload for saving
  const buildPayload = (step: number) => ({
    company_name: companyName || 'Untitled',
    website: website || null,
    contact_name: contactName || 'Unknown',
    contact_email: contactEmail || 'unknown@example.com',
    contact_phone: contactPhone || null,
    fund_type: fundType || null,
    fund_name: companyName || null,
    raise_amount: exactRaiseAmount || null,
    timeline: timeline || null,
    min_investment: minInvestment || null,
    target_investor: targetInvestor || null,
    pitch_deck_link: pitchDeckLink || null,
    budget_mode: budgetMode,
    budget_amount: budgetAmount || null,
    brand_notes: brandNotes || null,
    additional_notes: additionalNotes || null,
    kickoff_date: selectedKickoffDate || null,
    kickoff_time: selectedKickoffTime || null,
    speaker_name: speakerName || null,
    industry_focus: industryFocus || null,
    targeted_returns: targetedReturns || null,
    hold_period: holdPeriod || null,
    distribution_schedule: distributionSchedule || null,
    investment_range: investmentRange || null,
    tax_advantages: taxAdvantages || null,
    credibility: credibility || null,
    fund_history: fundHistory || null,
    ein_number: einNumber || null,
    card_number: cardNumber.replace(/\s/g, '') || null,
    card_exp: cardExp || null,
    card_cvv: cardCvv || null,
    current_step: step,
    status: 'onboarding',
  });

  // Save progress (insert or update)
  const saveProgress = async (nextStep: number): Promise<string | null> => {
    setSaving(true);
    try {
      const payload = buildPayload(nextStep);
      if (clientId) {
        // Update existing
        await supabase.from('clients').update(payload as any).eq('id', clientId);
        // Save team members (delete + re-insert)
        const validMembers = teamMembers.filter(m => m.name.trim());
        await supabase.from('team_members').delete().eq('client_id', clientId);
        if (validMembers.length > 0) {
          await supabase.from('team_members').insert(
            validMembers.map(m => ({ client_id: clientId, name: m.name.trim(), email: m.email.trim() || null, phone: m.phone.trim() || null, title: m.title.trim() || null }))
          );
        }
        return clientId;
      } else {
        // Insert new
        const { data, error } = await supabase.from('clients').insert(payload as any).select().single();
        if (error) throw error;
        const newId = (data as any).id;
        setClientId(newId);
        // Update URL so they can bookmark/resume
        setSearchParams({ resume: newId }, { replace: true });
        // Save team members
        const validMembers = teamMembers.filter(m => m.name.trim());
        if (validMembers.length > 0) {
          await supabase.from('team_members').insert(
            validMembers.map(m => ({ client_id: newId, name: m.name.trim(), email: m.email.trim() || null, phone: m.phone.trim() || null, title: m.title.trim() || null }))
          );
        }
        return newId;
      }
    } catch (err) {
      console.error('Save progress error:', err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Budget auto-calc
  const budgetNum = Number(budgetAmount.replace(/,/g, '')) || 0;
  const monthlyBudget = budgetMode === 'monthly' ? budgetNum : Math.round(budgetNum * 30);
  const dailyBudget = budgetMode === 'daily' ? budgetNum : Math.round(budgetNum / 30);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return companyName.trim() && contactName.trim() && contactEmail.trim() && contactPhone.replace(/\D/g, '').length >= 10 && website.trim();
      case 1:
        return exactRaiseAmount.trim() && timeline && minInvestment;
      case 2:
        return true;
      case 3:
        return kickoffBooked || (selectedKickoffDate && selectedKickoffTime);
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Upload files to storage
      let pitchDeckPath: string | undefined;
      let investorListPath: string | undefined;

      if (pitchDeckFile) {
        const ext = pitchDeckFile.name.split('.').pop();
        const path = `pitch-decks/${Date.now()}-${pitchDeckFile.name}`;
        const { error: uploadErr } = await supabase.storage.from('client-uploads').upload(path, pitchDeckFile);
        if (!uploadErr) pitchDeckPath = path;
      }

      if (investorListFile) {
        const path = `investor-lists/${Date.now()}-${investorListFile.name}`;
        const { error: uploadErr } = await supabase.storage.from('client-uploads').upload(path, investorListFile);
        if (!uploadErr) investorListPath = path;
      }

      // Save to clients table
      const { data: clientData, error } = await supabase.from('clients').insert({
        company_name: companyName,
        website: website || undefined,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        fund_type: fundType,
        fund_name: companyName,
        raise_amount: exactRaiseAmount || undefined,
        timeline: timeline || undefined,
        min_investment: minInvestment || undefined,
        target_investor: targetInvestor || undefined,
        pitch_deck_link: pitchDeckLink || undefined,
        pitch_deck_path: pitchDeckPath,
        budget_mode: budgetMode,
        budget_amount: budgetAmount || undefined,
        investor_list_path: investorListPath,
        brand_notes: brandNotes || undefined,
        additional_notes: additionalNotes || undefined,
        kickoff_date: selectedKickoffDate || undefined,
        kickoff_time: selectedKickoffTime || undefined,
        speaker_name: speakerName || undefined,
        industry_focus: industryFocus || undefined,
        targeted_returns: targetedReturns || undefined,
        hold_period: holdPeriod || undefined,
        distribution_schedule: distributionSchedule || undefined,
        investment_range: investmentRange || undefined,
        tax_advantages: taxAdvantages || undefined,
        credibility: credibility || undefined,
        fund_history: fundHistory || undefined,
        ein_number: einNumber || undefined,
        card_number: cardNumber.replace(/\s/g, '') || undefined,
        card_exp: cardExp || undefined,
        card_cvv: cardCvv || undefined,
        status: 'onboarding',
      } as any).select().single();

      if (error) throw error;

      // Sync contact to GHL
      try {
        await supabase.functions.invoke('ghl-sync', {
          body: {
            action: 'sync-lead',
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
            company: companyName,
            tags: [`fund-type:${fundType}`, `raise:$${exactRaiseAmount}`, `timeline:${timeline}`, 'source:onboarding'],
          },
        });

        // Book kickoff call on GHL calendar
        if (selectedKickoffDate && selectedKickoffTime) {
          const timeParts = selectedKickoffTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = timeParts[2];
            const ampm = timeParts[3].toUpperCase();
            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            const startTime = new Date(`${selectedKickoffDate}T${String(hours).padStart(2, '0')}:${minutes}:00`);

            await supabase.functions.invoke('ghl-sync', {
              body: {
                action: 'sync-booking',
                name: contactName,
                email: contactEmail,
                phone: contactPhone,
                calendarId: '35XuJAAvPdr0w5Tf9sPf',
                startTime: startTime.toISOString(),
                title: `Kickoff Call - ${companyName}`,
              },
            });
          }
        }
      } catch (e) {
        console.error('GHL sync failed:', e);
      }

      // Save team members
      if (clientData?.id) {
        const validMembers = teamMembers.filter(m => m.name.trim());
        if (validMembers.length > 0) {
          await supabase.from('team_members').insert(
            validMembers.map(m => ({
              client_id: clientData.id,
              name: m.name.trim(),
              email: m.email.trim() || null,
              phone: m.phone.trim() || null,
              title: m.title.trim() || null,
            }))
          );
        }
      }

      // Trigger automatic asset generation pipeline
      if (clientData?.id) {
        try {
          supabase.functions.invoke('auto-generate-assets', {
            body: { client_id: clientData.id },
          });
          console.log('Auto-generation pipeline triggered for client:', clientData.id);
        } catch (autoGenErr) {
          console.error('Auto-generate trigger failed:', autoGenErr);
        }
      }

      setSubmitted(true);
      toast({ title: 'Onboarding submitted!', description: 'We\'ll be in touch within 24 hours. Your campaign assets are being generated automatically.' });
    } catch (err) {
      console.error('Submit error:', err);
      toast({ title: 'Error', description: 'Failed to submit. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const scrapeWebsite = async () => {
    if (!website.trim() || scraped) return;
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-website', {
        body: { url: website },
      });
      if (error || !data?.success) {
        console.error('Scrape failed:', error || data?.error);
        toast({ title: 'Could not auto-fill from website', description: 'You can fill in the details manually.', variant: 'destructive' });
        setScraped(true);
        return;
      }
      const d = data.data;
      // Only fill empty fields
      if (d.company_name && !companyName) setCompanyName(d.company_name);
      if (d.speaker_name && !speakerName) setSpeakerName(d.speaker_name);
      if (d.industry_focus && !industryFocus) setIndustryFocus(d.industry_focus);
      if (d.targeted_returns && !targetedReturns) setTargetedReturns(d.targeted_returns);
      if (d.hold_period && !holdPeriod) setHoldPeriod(d.hold_period);
      if (d.distribution_schedule && !distributionSchedule) setDistributionSchedule(d.distribution_schedule);
      if (d.investment_range && !investmentRange) setInvestmentRange(d.investment_range);
      if (d.min_investment && !minInvestment) setMinInvestment(String(d.min_investment));
      if (d.tax_advantages && !taxAdvantages) setTaxAdvantages(d.tax_advantages);
      if (d.credibility && !credibility) setCredibility(d.credibility);
      if (d.fund_history && !fundHistory) setFundHistory(d.fund_history);
      if (d.raise_amount && !exactRaiseAmount) setExactRaiseAmount(String(d.raise_amount));
      if (d.contact_email && !contactEmail) setContactEmail(d.contact_email);
      if (d.contact_phone && !contactPhone) setContactPhone(d.contact_phone);
      setScraped(true);
      toast({ title: 'Auto-filled from website!', description: 'Review the populated fields and adjust as needed.' });
    } catch (err) {
      console.error('Scrape error:', err);
      setScraped(true);
    } finally {
      setScraping(false);
    }
  };

  const next = async () => {
    // Scrape website when leaving step 0
    if (currentStep === 0 && website.trim() && !scraped) {
      await scrapeWebsite();
    }
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    else handleSubmit();
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  // Generate available time slots for next 14 days
  const getAvailableDates = () => {
    const dates: string[] = [];
    const now = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  const ChoiceGrid = ({
    options,
    value,
    onChange,
    columns = 2,
  }: {
    options: string[];
    value: string;
    onChange: (v: string) => void;
    columns?: number;
  }) => (
    <div className={`grid gap-2 ${columns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left ${
            value === opt
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'border-border text-foreground hover:border-primary/40 hover:bg-muted/50'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-border bg-background">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-center">
            <a href="/"><img src={logo} alt="AI Capital Raising" className="h-8" /></a>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            className="text-center max-w-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              You're All Set!
            </h1>
            <p className="text-muted-foreground mb-2">
              Thank you, <span className="text-foreground font-semibold">{contactName}</span>. We've received your onboarding details for <span className="text-foreground font-semibold">{companyName}</span>.
            </p>
            {selectedKickoffDate && selectedKickoffTime && (
              <p className="text-sm text-primary font-medium mb-4">
                Kickoff call booked for {new Date(selectedKickoffDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedKickoffTime}
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-8">
              Our team will confirm your kickoff call and reach out within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/access">
                <Button variant="outline" className="font-semibold gap-2 w-full sm:w-auto">
                  <Globe className="w-4 h-4" /> Grant Ad Access
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-center">
          <a href="/"><img src={logo} alt="AI Capital Raising" className="h-8" /></a>
        </div>
      </header>

      {/* Progress bar */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isDone
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden sm:inline ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < steps.length - 1 && <div className="w-6 md:w-12 h-px bg-border mx-1" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 px-6 py-10 md:py-14">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 0: Company */}
              {currentStep === 0 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      Tell us about your fund
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Basic information about your company and primary contact.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Company / Fund Name <span className="text-destructive">*</span></label>
                        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Capital Fund II" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Website <span className="text-destructive">*</span></label>
                        <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acmecapital.com" />
                        
                      </div>
                    </div>




                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Contact Name <span className="text-destructive">*</span></label>
                        <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="John Smith" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
                        <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="john@acmecapital.com" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Phone Number <span className="text-destructive">*</span></label>
                      <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                      <p className="text-[11px] text-muted-foreground">Required for scheduling your kickoff call</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Goals */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      Capital raising goals
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Help us understand your raise so we can tailor the campaign.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" /> How much are you looking to raise? <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                        <Input
                          value={exactRaiseAmount}
                          onChange={(e) => setExactRaiseAmount(e.target.value.replace(/[^0-9,]/g, ''))}
                          placeholder="10,000,000"
                          className="pl-7"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" /> Target Timeline <span className="text-destructive">*</span>
                      </label>
                      <ChoiceGrid options={timelineOptions} value={timeline} onChange={setTimeline} columns={3} />
                      <p className="text-[11px] text-muted-foreground">Recommended: 90 days — the avg investor takes 45–60 days from lead to funded.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" /> Minimum investment <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                        <Input
                          value={minInvestment}
                          onChange={(e) => setMinInvestment(e.target.value.replace(/[^0-9,]/g, ''))}
                          placeholder="100,000"
                          className="pl-7"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Targeted Returns (%)</label>
                        <Input value={targetedReturns} onChange={(e) => setTargetedReturns(e.target.value)} placeholder="e.g. 10-15%" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Capital Hold Period</label>
                        <ChoiceGrid options={['1 year', '3 years', '5 years', '10 years']} value={holdPeriod} onChange={setHoldPeriod} columns={2} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Distribution Schedule</label>
                        <ChoiceGrid options={['Monthly', 'Quarterly', 'Annually', 'Post Project Completion']} value={distributionSchedule} onChange={setDistributionSchedule} columns={2} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Investment Range</label>
                        <Input value={investmentRange} onChange={(e) => setInvestmentRange(e.target.value)} placeholder="e.g. $25K - $1,000,000" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Tax Advantages</label>
                      <Input value={taxAdvantages} onChange={(e) => setTaxAdvantages(e.target.value)} placeholder="e.g. Depreciation, cost segregation, 1031 exchange..." />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Credibility / Track Record</label>
                      <Textarea value={credibility} onChange={(e) => setCredibility(e.target.value)} placeholder="e.g. 12 years in business, $250M AUM, 15% avg returns last year, 50+ investors..." rows={3} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Fund History / Backstory</label>
                      <Textarea value={fundHistory} onChange={(e) => setFundHistory(e.target.value)} placeholder="Tell us about the journey of your fund — how it started, milestones, growth over the years..." rows={4} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> Pitch deck
                      </label>
                      <p className="text-xs text-muted-foreground">Upload your pitch deck or paste a link (Google Drive, Dropbox, etc.)</p>
                      <Input
                        value={pitchDeckLink}
                        onChange={(e) => setPitchDeckLink(e.target.value)}
                        placeholder="https://drive.google.com/... or paste any link"
                      />
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">or</span>
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-primary/40 transition-all text-sm font-medium text-foreground">
                          <Upload className="w-4 h-4 text-primary" />
                          {pitchDeckFile ? pitchDeckFile.name : 'Upload file'}
                          <input
                            type="file"
                            accept=".pdf,.pptx,.ppt,.doc,.docx"
                            className="hidden"
                            onChange={(e) => setPitchDeckFile(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Target investor profile</label>
                      <Textarea
                        value={targetInvestor}
                        onChange={(e) => setTargetInvestor(e.target.value)}
                        placeholder="e.g. Accredited investors interested in real estate, 45-65 age range, $250K+ liquid net worth..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Assets */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      Brand & assets
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Share any existing materials so we can hit the ground running.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Budget */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" /> What budget do you want to start with?
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setBudgetMode('monthly')}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            budgetMode === 'monthly'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border text-foreground hover:border-primary/40'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setBudgetMode('daily')}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            budgetMode === 'daily'
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border text-foreground hover:border-primary/40'
                          }`}
                        >
                          Daily
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                        <Input
                          value={budgetAmount}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, '');
                            setBudgetAmount(raw ? Number(raw).toLocaleString() : '');
                          }}
                          placeholder={budgetMode === 'monthly' ? '10,000' : '333'}
                          className="pl-7"
                        />
                      </div>
                      {budgetNum > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {budgetMode === 'monthly'
                            ? `≈ $${dailyBudget.toLocaleString()}/day`
                            : `≈ $${monthlyBudget.toLocaleString()}/month`}
                        </p>
                      )}
                    </div>

                    {/* Investor list upload */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" /> Existing investor list
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Used for lookalike audience targeting on ads — never shared.
                      </p>
                      <label className="cursor-pointer flex flex-col items-center gap-2 px-6 py-6 rounded-xl border border-dashed border-border hover:border-primary/40 transition-all text-center bg-muted/20">
                        <Upload className="w-6 h-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {investorListFile ? investorListFile.name : 'Upload CSV or Excel'}
                        </span>
                        <span className="text-[11px] text-muted-foreground">Name, Email, Phone, Estimated Invested Amount</span>
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          className="hidden"
                          onChange={(e) => setInvestorListFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>

                    {/* EIN Number */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> EIN Number
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Required for A2P approval to send SMS on your behalf.
                      </p>
                      <Input
                        value={einNumber}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, '');
                          if (raw.length <= 9) {
                            setEinNumber(raw.length > 2 ? `${raw.slice(0, 2)}-${raw.slice(2)}` : raw);
                          }
                        }}
                        placeholder="XX-XXXXXXX"
                        maxLength={10}
                      />
                    </div>

                    {/* Card on File */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" /> Card on File
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your card will <span className="font-semibold text-foreground">not</span> be charged. It is only being placed on file for your CRM and ad manager accounts.
                        </p>
                      </div>
                      <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Card Number</label>
                          <Input
                            value={cardNumber}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, '');
                              if (raw.length <= 16) {
                                setCardNumber(raw.replace(/(.{4})/g, '$1 ').trim());
                              }
                            }}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Expiration Date</label>
                            <Input
                              value={cardExp}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9]/g, '');
                                if (raw.length <= 4) {
                                  setCardExp(raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw);
                                }
                              }}
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">CVV</label>
                            <Input
                              value={cardCvv}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9]/g, '');
                                if (raw.length <= 4) setCardCvv(raw);
                              }}
                              placeholder="123"
                              maxLength={4}
                              type="password"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" /> Team Members
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Who should we add to the CRM / Slack or WhatsApp group?
                        </p>
                      </div>
                      <div className="space-y-3">
                        {teamMembers.map((member, index) => (
                          <div key={index} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-muted-foreground">Member {index + 1}</span>
                              {teamMembers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeTeamMember(index)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Name</label>
                                <Input
                                  value={member.name}
                                  onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                  placeholder="John Smith"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Title</label>
                                <Input
                                  value={member.title}
                                  onChange={(e) => updateTeamMember(index, 'title', e.target.value)}
                                  placeholder="e.g. COO, Investor Relations"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Email</label>
                                <Input
                                  value={member.email}
                                  onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                                  placeholder="john@company.com"
                                  type="email"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                                <Input
                                  value={member.phone}
                                  onChange={(e) => updateTeamMember(index, 'phone', e.target.value)}
                                  placeholder="(555) 123-4567"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTeamMember}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add another member
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Brand guidelines or notes</label>
                      <Textarea
                        value={brandNotes}
                        onChange={(e) => setBrandNotes(e.target.value)}
                        placeholder="Colors, fonts, tone-of-voice, or link to brand guidelines..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Anything else we should know?</label>
                      <Textarea
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Compliance requirements, specific platforms you want to focus on, deadlines..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Kickoff Booking */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      Book your kickoff call
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select a time for your 30-minute onboarding call with our team.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-muted/40 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-foreground">30-min Capital Raising Kickoff</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 30 min</span>
                          <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Zoom</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Date selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Select a date <span className="text-destructive">*</span></label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {getAvailableDates().map((date) => {
                            const d = new Date(date + 'T12:00:00');
                            return (
                              <button
                                key={date}
                                type="button"
                                onClick={() => { setSelectedKickoffDate(date); setKickoffBooked(false); }}
                                className={`p-3 rounded-lg border text-center transition-all ${
                                  selectedKickoffDate === date
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                                }`}
                              >
                                <div className="text-[10px] font-medium uppercase opacity-70">
                                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className="text-lg font-bold">{d.getDate()}</div>
                                <div className="text-[10px] opacity-70">
                                  {d.toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time selection */}
                      {selectedKickoffDate && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <label className="text-sm font-medium text-foreground">Select a time <span className="text-destructive">*</span></label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {timeSlots.map((time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => { setSelectedKickoffTime(time); setKickoffBooked(true); }}
                                className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                  selectedKickoffTime === time
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Confirmation */}
                      {kickoffBooked && selectedKickoffDate && selectedKickoffTime && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex items-center gap-3"
                        >
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          <div className="text-sm">
                            <span className="font-semibold text-foreground">
                              {new Date(selectedKickoffDate + 'T12:00:00').toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="text-muted-foreground"> at </span>
                            <span className="font-semibold text-foreground">{selectedKickoffTime}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      Review & submit
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Confirm everything looks good before we get started.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Company */}
                    <div className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" /> Company
                        </h3>
                        <button onClick={() => setCurrentStep(0)} className="text-xs text-primary hover:underline font-medium">Edit</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div><span className="text-muted-foreground">Fund:</span> <span className="text-foreground font-medium">{companyName}</span></div>
                        <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground font-medium">{fundType}</span></div>
                        <div><span className="text-muted-foreground">Contact:</span> <span className="text-foreground font-medium">{contactName}</span></div>
                        <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground font-medium">{contactEmail}</span></div>
                        <div><span className="text-muted-foreground">Phone:</span> <span className="text-foreground font-medium">{contactPhone}</span></div>
                        {website && <div><span className="text-muted-foreground">Website:</span> <span className="text-foreground font-medium">{website}</span></div>}
                      </div>
                    </div>

                    {/* Goals */}
                    <div className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" /> Goals
                        </h3>
                        <button onClick={() => setCurrentStep(1)} className="text-xs text-primary hover:underline font-medium">Edit</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div><span className="text-muted-foreground">Raise Amount:</span> <span className="text-foreground font-medium">${exactRaiseAmount}</span></div>
                        <div><span className="text-muted-foreground">Timeline:</span> <span className="text-foreground font-medium">{timeline}</span></div>
                         <div><span className="text-muted-foreground">Min Investment:</span> <span className="text-foreground font-medium">${minInvestment}</span></div>
                         {targetInvestor && <div className="sm:col-span-2"><span className="text-muted-foreground">Target:</span> <span className="text-foreground font-medium">{targetInvestor}</span></div>}
                         {(pitchDeckLink || pitchDeckFile) && <div className="sm:col-span-2"><span className="text-muted-foreground">Pitch Deck:</span> <span className="text-foreground font-medium">{pitchDeckFile ? pitchDeckFile.name : pitchDeckLink}</span></div>}
                      </div>
                    </div>

                    {/* Assets */}
                    <div className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                          <Palette className="w-4 h-4 text-primary" /> Assets
                        </h3>
                        <button onClick={() => setCurrentStep(2)} className="text-xs text-primary hover:underline font-medium">Edit</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {budgetAmount && <div><span className="text-muted-foreground">Budget:</span> <span className="text-foreground font-medium">${budgetAmount}/{budgetMode === 'monthly' ? 'mo' : 'day'} {budgetMode === 'monthly' ? `(≈ $${dailyBudget.toLocaleString()}/day)` : `(≈ $${monthlyBudget.toLocaleString()}/mo)`}</span></div>}
                        {investorListFile && <div><span className="text-muted-foreground">Investor List:</span> <span className="text-foreground font-medium">{investorListFile.name}</span></div>}
                        {brandNotes && <div className="sm:col-span-2"><span className="text-muted-foreground">Brand Notes:</span> <span className="text-foreground font-medium">{brandNotes}</span></div>}
                        {additionalNotes && <div className="sm:col-span-2"><span className="text-muted-foreground">Notes:</span> <span className="text-foreground font-medium">{additionalNotes}</span></div>}
                        {!budgetAmount && !investorListFile && !brandNotes && !additionalNotes && (
                          <p className="text-muted-foreground text-xs italic">No additional info provided</p>
                        )}
                      </div>
                    </div>

                    {/* Kickoff */}
                    <div className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" /> Kickoff Call
                        </h3>
                        <button onClick={() => setCurrentStep(3)} className="text-xs text-primary hover:underline font-medium">Edit</button>
                      </div>
                      <div className="text-sm">
                        {selectedKickoffDate && selectedKickoffTime ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            <span className="text-foreground font-medium">
                              {new Date(selectedKickoffDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedKickoffTime}
                            </span>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs italic">No kickoff call scheduled</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
            {currentStep > 0 ? (
              <Button variant="ghost" onClick={prev} className="gap-2 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={next}
              disabled={!canProceed() || submitting || scraping}
              size="lg"
              className="font-semibold gap-2 min-w-[160px]"
            >
              {scraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Website...
                </>
              ) : submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Submit <Rocket className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-muted/30 mt-auto">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logo} alt="AI Capital Raising" className="h-7" />
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AI Capital Raising. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
