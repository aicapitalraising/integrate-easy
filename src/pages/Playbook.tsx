import { useState, useEffect, createContext, useContext } from "react";
import { CheckCircle, Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/logo-aicra.png";
import iconFundManagers from "@/assets/playbook/icon-fund-managers.png";
import iconRealEstate from "@/assets/playbook/icon-real-estate.png";
import iconPrivateEquity from "@/assets/playbook/icon-private-equity.png";
import iconStartup from "@/assets/playbook/icon-startup.png";
import iconWealthAdvisor from "@/assets/playbook/icon-wealth-advisor.png";

/* ─── Access Form Context ─── */
type AccessFormContextType = { open: boolean; setOpen: (o: boolean) => void };
const AccessFormContext = createContext<AccessFormContextType>({ open: false, setOpen: () => {} });
const useAccessForm = () => useContext(AccessFormContext);

/* ─── Countdown Hook ─── */
const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
};

/* ─── Countdown Unit ─── */
const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="font-display text-lg font-extrabold leading-none text-primary-foreground sm:text-xl md:text-2xl">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[9px] uppercase tracking-wider text-primary-foreground/70 sm:text-[10px]">{label}</span>
  </div>
);

/* ─── CTA Button ─── */
const CTAButton = ({ className = "" }: { className?: string }) => {
  const { setOpen } = useAccessForm();
  return (
    <button
      onClick={() => setOpen(true)}
      className={`inline-block bg-primary text-primary-foreground rounded-lg px-6 py-3.5 font-display text-sm font-bold transition-all hover:bg-primary/90 shadow-lg hover:shadow-xl sm:px-8 sm:py-4 sm:text-base ${className}`}
    >
      Click Here to Access It Now
    </button>
  );
};

/* ─── Access Form Dialog ─── */
const AccessFormDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!phone.trim()) errs.phone = "Phone is required";
    if (!/^[\d\s\-+()]+$/.test(phone.trim())) errs.phone = "Invalid phone number";
    if (!email.trim()) errs.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Invalid email";
    if (!agreed) errs.agreed = "You must agree to continue";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    window.location.href = "https://playbook.aicapitalraising.com/checkout-playbook";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-background p-0 sm:rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-center">
          <div className="flex justify-center">
            <img src={logo} alt="AI Capital Raising Accelerator" className="h-12" />
          </div>
          <h2 className="mt-3 font-display text-lg font-extrabold text-foreground md:text-xl">
            Get Instant Access Below 👇
          </h2>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <div>
            <Input placeholder="Full Name*" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
            {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
          </div>
          <div>
            <Input placeholder="Phone*" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
          </div>
          <div>
            <Input type="email" placeholder="Email*" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground rounded-lg py-4 font-display text-base font-bold transition-all hover:bg-primary/90">
            Click Here to Access It Now
          </button>
          <div className="flex items-start gap-3">
            <Checkbox id="pb-consent" checked={agreed} onCheckedChange={(c) => setAgreed(c === true)} className="mt-1" />
            <label htmlFor="pb-consent" className="text-xs leading-relaxed text-muted-foreground">
              By submitting this form, you agree to receive marketing communications, including text messages and phone calls, from our business. You can opt out at any time by replying "STOP".
            </label>
          </div>
          {errors.agreed && <p className="text-xs text-destructive">{errors.agreed}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Data ─── */
const discoverItems = [
  "How to get accredited investors coming to YOU instead of chasing them.",
  "How to use AI and automation to pre-qualify investors before a single conversation.",
  "Feel completely in control with our comprehensive checklists, templates, and negotiation scripts.",
];

const failReasons = [
  "Relying on Personal Networks – Your contacts will only take you so far before you run out of new investors.",
  "High Brokerage Fees – Giving away a percentage of the capital you raise eats into your profitability.",
  "Attending Events Without a Strategy – Meeting people is great, but without a system, you leave money on the table.",
  "Failing to Qualify Investors – Wasting time on people who aren't serious or don't meet accreditation requirements.",
];

const audiences = [
  { img: iconFundManagers, title: "Fund Managers & Syndicators" },
  { img: iconRealEstate, title: "Real Estate Investors" },
  { img: iconPrivateEquity, title: "Private Equity Firms" },
  { img: iconStartup, title: "Startup Founders" },
  { img: iconWealthAdvisor, title: "Wealth & Investment Advisors" },
];

const steps = [
  {
    number: "1", title: "AI-Powered Investor Lead Generation",
    bullets: [
      "How to attract investors who are actively looking for new opportunities.",
      "The ad strategy that generates investor leads for as little as $3 per lead.",
      "Why most investor outreach fails—and the simple fix that increases conversions by 300%.",
      'The "Investor Magnet" technique: How to structure messaging that immediately builds trust and credibility.',
    ],
    example: "A Houston-based fund raised $100K in 60 days with just $3.5K in ad spend using this strategy.",
  },
  {
    number: "2", title: "High-Converting Investor Funnels",
    bullets: [
      "The exact landing page structure that qualifies high-net-worth investors instantly.",
      "Why 90% of investor landing pages fail & how to increase conversions by 5X.",
      'The "Millionaire Messaging Formula:" How to craft copy that makes investors say YES.',
      "3 high-converting CTA (call-to-action) strategies that drive investor applications.",
    ],
    example: "A private equity firm increased investor appointment bookings by 42% just by making one tweak to their landing page structure.",
  },
  {
    number: "3", title: "AI-Driven Investor Nurturing & Follow-Up",
    bullets: [
      "How to automate investor follow-ups so they don't go cold.",
      "The exact email & SMS sequences that convert hesitant investors into committed capital.",
      "How to use AI to analyze investor behavior and know when to reach out.",
      "Why most investors need 5+ touchpoints before investing—and how to automate it.",
    ],
    example: "A private equity group saw a 32% increase in funded deals just by implementing AI-driven investor follow-up sequences.",
  },
];

const cons = [
  "Setup required – Needs funnels, ads, and automation.",
  "Upfront cost – Investment needed for tools & ads.",
  "Trust factor – AI can't fully replace personal relationships.",
  "Competition – Others may use similar strategies.",
  "Ongoing tweaks – Requires monitoring and optimization.",
];

const pros = [
  { icon: "🚀", text: "Investors come to you, instead of you chasing them." },
  { icon: "💰", text: "Raise capital at scale with a predictable system." },
  { icon: "📈", text: "Turn casual investor conversations into funded deals." },
  { icon: "⚡", text: "Proven system – Backed by real-world success." },
  { icon: "🤖", text: "Automation & AI – Saves time and effort." },
];

const pricingIncludes = [
  "Done-for-you ad creatives that attract accredited investors.",
  "High-converting funnel templates for investor lead generation.",
  "Proven investor outreach & email follow-up sequences.",
  "Tracking & analytics dashboard to measure investor engagement.",
];

const testimonials = [
  { title: '"We Finally Stopped Relying on Referrals"', quote: '"We were always dependent on referrals, which made growth unpredictable. Now we have a structured pipeline where investors come to us. Massive win!"', author: "Sarah M., Private Equity Manager" },
  { title: '"Automated and Scalable"', quote: '"Before this, raising capital felt like a constant hustle. Now, with AI automation in place, we have a predictable flow of investor meetings every week."', author: "Ravi T., Startup Founder" },
  { title: '"The Only Capital Raising Guide You Need"', quote: '"I\'ve bought multiple capital raising courses, but none were as clear and actionable as this one. The playbook gave us a step-by-step roadmap that actually works."', author: "Leona P., Tech Startup CEO" },
];

const faqs = [
  { q: "How is this different from traditional capital raising methods?", a: "Traditional methods rely on personal networks, referrals, or brokers—often unpredictable and slow. This playbook introduces an AI-driven system that attracts qualified accredited investors on autopilot." },
  { q: "Do I need prior experience in raising capital to use this playbook?", a: "No! Whether you're a fund manager, startup founder, or syndicator, this guide is structured for both beginners and experienced professionals." },
  { q: "How soon can I start seeing results?", a: "Many users see investor leads within the first 30 days of implementing the system." },
  { q: "Does this require a big marketing budget?", a: "No. The playbook teaches strategies that work with both organic outreach and paid advertising." },
  { q: "What's included in the full DFY Capital Raising Pack?", a: "Done-for-you ad templates, investor funnel templates, proven email & SMS sequences, and a real-time analytics dashboard." },
];

/* ─── Playbook Page ─── */
const Playbook = () => {
  const [open, setOpen] = useState(false);
  const deadline = new Date("2026-04-01T03:59:59Z"); // March 31 11:59 PM EST
  const { days, hours, minutes, seconds } = useCountdown(deadline);

  return (
    <AccessFormContext.Provider value={{ open, setOpen }}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Promo Countdown Banner */}
        <div className="bg-primary py-2.5 px-4">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="font-display text-xs font-bold tracking-wide text-primary-foreground sm:text-sm">
              PROMO ENDS IN
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
              <CountdownUnit value={days} label="Days" />
              <span className="text-primary-foreground/60 font-bold text-lg">:</span>
              <CountdownUnit value={hours} label="Hrs" />
              <span className="text-primary-foreground/60 font-bold text-lg">:</span>
              <CountdownUnit value={minutes} label="Min" />
              <span className="text-primary-foreground/60 font-bold text-lg">:</span>
              <CountdownUnit value={seconds} label="Sec" />
            </div>
            <span className="text-lg">🔥</span>
          </div>
        </div>

        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14 md:px-8">
            <a href="/"><img src={logo} alt="AI Capital Raising Accelerator" className="h-8" /></a>
            <div className="flex items-center gap-4">
              <a href="mailto:support@aicapitalraising.com" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">support@aicapitalraising.com</span>
              </a>
              <button
                onClick={() => setOpen(true)}
                className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg text-sm h-9 px-4 items-center transition-colors"
              >
                Get Access
              </button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-10 pb-14 md:py-24 bg-muted/30">
          <div className="max-w-6xl mx-auto grid items-center gap-8 px-4 md:grid-cols-2 md:px-8">
            <div className="space-y-5">
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">THE #1 AI-DRIVEN CAPITAL RAISING SYSTEM</p>
              <h1 className="font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                AI Capital Raising <span className="text-primary">Playbook</span>
              </h1>
              <p className="text-base leading-relaxed text-foreground sm:text-lg md:text-xl">
                How to Raise <span className="font-bold text-primary">$5M to $100M</span> Using an <span className="text-primary">AI-Driven System</span> That Attracts Accredited Investors on Autopilot
              </p>
              <p className="text-sm text-muted-foreground sm:text-base">
                Discover the <span className="underline">cutting-edge capital raising strategies</span> that top funds and startups are using to secure millions—without relying on personal networks, cold outreach, or expensive brokers.
              </p>
              <CTAButton />
            </div>
            <div className="flex justify-center order-first md:order-last">
              <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67ad6436773f0202312de872.png" alt="AI Capital Raising Playbook Book" className="w-full max-w-[280px] drop-shadow-2xl sm:max-w-sm md:max-w-lg" />
            </div>
          </div>
        </section>

        {/* Inside Playbook */}
        <section className="py-12 md:py-24">
          <div className="max-w-6xl mx-auto px-4 text-center md:px-8">
            <p className="mx-auto mb-8 max-w-3xl font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground md:text-base">
              If you've been frustrated with slow capital raises, wasted time pitching to the wrong people, or unpredictable investor interest, you're not alone.
            </p>
            <h2 className="mb-12 font-display text-2xl font-extrabold text-foreground sm:text-3xl md:text-5xl">Inside this playbook, you'll discover:</h2>
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              {discoverItems.map((item, i) => (
                <div key={i} className="glass-card-elevated rounded-xl p-6 text-left">
                  <CheckCircle className="mb-4 h-8 w-8 text-primary" />
                  <p className="text-base font-medium leading-relaxed text-foreground">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-2 text-center text-foreground">
              <p><strong>No more uncertainty</strong> about where your next round of funding is coming from.</p>
              <p><strong>No more relying</strong> on personal networks that quickly dry up.</p>
              <p><strong>No more hoping</strong> that a broker will find investors for you.</p>
              <p className="mt-4 text-muted-foreground">Instead, you'll learn <strong className="text-foreground">a systemized approach that works predictably</strong>—whether you're raising <strong>$1M or $100M.</strong></p>
            </div>
            <div className="mt-10"><CTAButton /></div>
          </div>
        </section>

        {/* Why Traditional Fails */}
        <section className="py-12 md:py-24 bg-muted/30 border-t border-border">
          <div className="max-w-6xl mx-auto grid items-center gap-12 px-4 md:grid-cols-2 md:px-8">
            <div>
              <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67ae70487322557fbe14f604.png" alt="AI Robot" className="mx-auto max-w-xs md:max-w-sm" />
            </div>
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">
                Why Traditional Capital Raising Strategies Fail <span className="text-primary">(And What to Do Instead)</span>
              </h2>
              <p className="text-muted-foreground">Before we dive into the AI-driven framework, it's important to understand why most capital raising efforts stall or fail completely:</p>
              <ul className="space-y-4">
                {failReasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <h3 className="font-display text-2xl font-extrabold text-foreground md:text-3xl">The solution?</h3>
                <p className="mt-2 text-lg font-semibold text-foreground">A fully automated, AI-powered investor acquisition system.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Perfect For */}
        <section className="py-12 md:py-24">
          <div className="max-w-6xl mx-auto px-4 text-center md:px-8">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">PROCESS</p>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-foreground sm:text-3xl md:text-5xl">This playbook is perfect for:</h2>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
              {audiences.map((a, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                    <img src={a.img} alt={a.title} loading="lazy" width={512} height={512} className="h-32 w-full object-cover sm:h-40 md:h-48" />
                  </div>
                  <h3 className="font-display text-sm font-bold text-foreground md:text-base">{a.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Three Steps */}
        <section className="py-12 md:py-24 bg-muted/30 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 text-center md:px-8">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">The AI Capital Raising Framework:</p>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-foreground sm:text-3xl md:text-5xl">The 3-Step System to Attract & Secure Accredited Investors</h2>
            <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
              This framework has been used to raise over <strong className="text-primary italic">$7M in just 5 months</strong> for a real estate fund.
            </p>
            <div className="mt-12 space-y-10 text-left">
              {steps.map((s) => (
                <div key={s.number} className="glass-card-elevated rounded-2xl p-6 md:p-10">
                  <h3 className="font-display text-2xl font-extrabold text-foreground md:text-3xl">
                    <span className="text-primary">Step {s.number}:</span> {s.title}
                  </h3>
                  <ul className="mt-6 space-y-3">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-foreground">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 rounded-lg bg-muted p-4">
                    <p className="text-muted-foreground">💡 <strong className="text-foreground">Real-World Example: </strong>{s.example}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12"><CTAButton /></div>
          </div>
        </section>

        {/* Why You Need */}
        <section className="py-12 md:py-24">
          <div className="max-w-6xl mx-auto px-4 text-center md:px-8">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">WHY YOU NEED THIS</p>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-foreground sm:text-3xl md:text-5xl">What Happens When You Implement This?</h2>
            <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
              <div className="glass-card-elevated rounded-2xl p-6 text-left">
                {cons.map((c, i) => (
                  <p key={i} className="mb-3 flex items-start gap-3 text-muted-foreground">
                    <span className="shrink-0">❌</span> {c}
                  </p>
                ))}
              </div>
              <div className="rounded-2xl border-2 border-primary bg-card p-6 text-left shadow-sm">
                {pros.map((p, i) => (
                  <p key={i} className="mb-3 flex items-start gap-3 text-foreground">
                    <span className="shrink-0">{p.icon}</span> {p.text}
                  </p>
                ))}
              </div>
            </div>
            <p className="mx-auto mt-10 max-w-2xl text-lg text-foreground">This is <strong>not just theory</strong>—this is a proven, scalable system used to raise <strong>millions</strong>.</p>
            <div className="mt-8"><CTAButton /></div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-12 md:py-24 bg-muted/30 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="mx-auto max-w-4xl glass-card-elevated rounded-3xl p-8 md:p-12">
              <div className="grid items-center gap-10 md:grid-cols-2">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/3b47f04b-8523-4abf-973c-72dc50a14f39.png" alt="Stars" className="h-6" />
                    <span className="text-sm text-muted-foreground">4.9/5 star reviews from 500+ couples</span>
                  </div>
                  <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">AI Capital Raising Playbook</h2>
                  <p className="mt-2 text-muted-foreground">Unlock the Complete System (Ads, Funnels, Investor Email Templates & More).</p>
                  <div className="mt-6 flex gap-4">
                    <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67ad6436773f0202312de872.png" alt="Book" className="h-32 md:h-40" />
                    <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67ae70487322557fbe14f604.png" alt="AI" className="h-32 md:h-40" />
                  </div>
                </div>
                <div className="rounded-2xl border-2 border-primary bg-card p-6 shadow-[0_0_30px_hsl(142_52%_36%/0.15),0_0_60px_hsl(142_52%_36%/0.05)]">
                  <h3 className="font-display text-xl font-bold text-foreground">Here's what you get:</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Includes:</p>
                  <ul className="mt-4 space-y-3">
                    {pricingIncludes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">Today Just</p>
                    <p className="font-display text-4xl font-extrabold text-primary">
                      $27 <span className="text-base font-normal text-muted-foreground">one time</span>
                    </p>
                  </div>
                  <div className="mt-6"><CTAButton className="w-full text-center" /></div>
                </div>
              </div>
            </div>

            {/* Featured testimonial */}
            <div className="mx-auto mt-12 max-w-3xl glass-card-elevated rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67b2b11870fcfe34f6264444.png" alt="Testimonial" className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <p className="font-display text-lg font-bold text-foreground">"Game-Changer for Our Fund"</p>
                  <p className="mt-2 text-sm italic text-muted-foreground">"We struggled for months trying to raise capital the traditional way. After implementing this playbook, we secured $500K in commitments within 60 days."</p>
                  <p className="mt-3 text-sm font-semibold text-primary">— Vanessa L., Real Estate Syndicator</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 md:py-24">
          <div className="max-w-6xl mx-auto px-4 text-center md:px-8">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">TESTIMONIALS</p>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-foreground sm:text-3xl md:text-5xl">See How Other People Saved Thousands</h2>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <div key={i} className="glass-card-elevated rounded-2xl p-6 text-left">
                  <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/7e8d238f-262a-4578-9584-868f586cf85c.png" alt={t.author} className="mb-4 h-16 w-16 rounded-full object-cover" />
                  <h3 className="font-display text-lg font-bold text-foreground">{t.title}</h3>
                  <p className="mt-3 text-sm italic text-muted-foreground">{t.quote}</p>
                  <p className="mt-4 text-sm font-semibold text-primary">— {t.author}</p>
                </div>
              ))}
            </div>
            <div className="mt-12"><CTAButton /></div>
          </div>
        </section>

        {/* Guarantee */}
        <section className="py-12 md:py-24 bg-muted/30 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 text-center md:px-8">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">STILL NOT SURE?</p>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-foreground sm:text-3xl md:text-5xl">Our Ironclad 100% Risk-Free Guarantee</h2>
            <div className="mx-auto mt-10 grid max-w-4xl items-center gap-10 md:grid-cols-2">
              <div className="space-y-4 text-left text-muted-foreground">
                <p>We are so confident in the <strong className="text-foreground">AI Capital Raising Playbook</strong> that we're putting our money where our mouth is.</p>
                <p>If you implement the strategies and don't see a measurable increase in investor interest within 60 days, we'll refund 100% of your investment—no questions asked.</p>
                <p className="font-semibold text-foreground">That's how much we believe in this system.</p>
              </div>
              <div className="flex justify-center">
                <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/662a0e2ded5f234b9ce5379c.jpeg" alt="Guarantee Badge" className="max-w-xs" />
              </div>
            </div>
            <div className="mt-10"><CTAButton /></div>
            <p className="mt-4 text-sm text-muted-foreground">Take action today—your next investor is waiting.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-24">
          <div className="max-w-6xl mx-auto px-4 text-center md:px-8">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">STILL GOT QUESTIONS?</p>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-foreground sm:text-3xl md:text-5xl">Frequently Asked Questions</h2>
            <div className="mx-auto mt-12 max-w-3xl text-left">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="glass-card-elevated rounded-xl px-6 border-border">
                    <AccordionTrigger className="font-display text-base font-semibold text-foreground hover:no-underline">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 md:py-24 bg-muted/30 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 text-center md:px-8">
            <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl md:text-5xl">Enroll now before it's too late!</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Lock in your access to the complete system for just $27 before this special offer expires.</p>
            <div className="mt-8"><CTAButton /></div>
            <p className="mt-4 text-sm font-semibold text-primary">Price going up soon!</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 bg-muted/30">
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 px-4 md:px-8">
            <img src={logo} alt="AI Capital Raising" className="h-8" />
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AI Capital Raising. All rights reserved.</p>
          </div>
        </footer>
      </div>
      <AccessFormDialog open={open} onOpenChange={setOpen} />
    </AccessFormContext.Provider>
  );
};

export default Playbook;
