import { useState, createContext, useContext } from "react";
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

import logoAicra from "@/assets/playbook/black-logo-aicra.png";
import iconFundManagers from "@/assets/playbook/icon-fund-managers.png";
import iconRealEstate from "@/assets/playbook/icon-real-estate.png";
import iconPrivateEquity from "@/assets/playbook/icon-private-equity.png";
import iconStartup from "@/assets/playbook/icon-startup.png";
import iconWealthAdvisor from "@/assets/playbook/icon-wealth-advisor.png";

/* ─── Access Form Context ─── */
type AccessFormContextType = { open: boolean; setOpen: (o: boolean) => void };
const AccessFormContext = createContext<AccessFormContextType>({ open: false, setOpen: () => {} });
const useAccessForm = () => useContext(AccessFormContext);

/* ─── CTA Button ─── */
const CTAButton = ({ className = "" }: { className?: string }) => {
  const { setOpen } = useAccessForm();
  return (
    <button
      onClick={() => setOpen(true)}
      className={`inline-block gradient-green rounded-lg px-8 py-4 font-heading text-base font-bold text-[hsl(0_0%_2%)] transition-all hover:opacity-90 animate-pulse-glow ${className}`}
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
      <DialogContent className="max-w-md border-[hsl(0_0%_18%)] bg-[hsl(0_0%_95%)] p-0 sm:rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-center">
          <div className="flex justify-center">
            <img src={logoAicra} alt="AI Capital Raising Accelerator" className="h-12" />
          </div>
          <h2 className="mt-3 font-heading text-lg font-extrabold text-[hsl(0_0%_4%)] md:text-xl">
            Get Instant Access Below 👇
          </h2>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <div>
            <Input placeholder="Full Name*" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} className="rounded-lg border-[hsl(0_0%_18%)] bg-[hsl(0_0%_4%)] text-[hsl(0_0%_95%)] placeholder:text-[hsl(0_0%_64%)]" />
            {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
          </div>
          <div>
            <Input placeholder="Phone*" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className="rounded-lg border-[hsl(0_0%_18%)] bg-[hsl(0_0%_4%)] text-[hsl(0_0%_95%)] placeholder:text-[hsl(0_0%_64%)]" />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
          </div>
          <div>
            <Input type="email" placeholder="Email*" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="rounded-lg border-[hsl(0_0%_18%)] bg-[hsl(0_0%_4%)] text-[hsl(0_0%_95%)] placeholder:text-[hsl(0_0%_64%)]" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <button type="submit" className="w-full gradient-green rounded-lg py-4 font-heading text-base font-bold text-[hsl(0_0%_2%)] transition-all hover:opacity-90">
            Click Here to Access It Now
          </button>
          <div className="flex items-start gap-3">
            <Checkbox id="pb-consent" checked={agreed} onCheckedChange={(c) => setAgreed(c === true)} className="mt-1 border-[hsl(0_0%_64%)] data-[state=checked]:bg-[hsl(142_71%_45%)] data-[state=checked]:border-[hsl(142_71%_45%)]" />
            <label htmlFor="pb-consent" className="text-xs leading-relaxed text-[hsl(0_0%_64%)]">
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

  // Shared style vars for the dark playbook theme
  const bg = "hsl(0 0% 4%)";
  const fg = "hsl(0 0% 95%)";
  const cardBg = "hsl(0 0% 8%)";
  const mutedFg = "hsl(0 0% 64%)";
  const borderC = "hsl(0 0% 18%)";
  const green = "hsl(142 71% 45%)";
  const elevatedBg = "hsl(0 0% 12%)";

  return (
    <AccessFormContext.Provider value={{ open, setOpen }}>
      <div className="playbook-theme min-h-screen" style={{ backgroundColor: bg, color: fg, fontFamily: "'Inter', sans-serif" }}>
        {/* Promo Banner */}
        <div style={{ backgroundColor: green }} className="py-2 text-center">
          <p className="font-heading text-sm font-bold tracking-wide md:text-base" style={{ color: "hsl(0 0% 2%)" }}>
            PROMO – ENDS March 24@ 11:59PM EST 💍
          </p>
        </div>

        {/* Navbar */}
        <nav className="py-4" style={{ backgroundColor: bg }}>
          <div className="container mx-auto flex items-center justify-between px-4 md:px-8">
            <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67bbe9a01cc1bb195ccebb93.png" alt="AI Capital Raising Accelerator" className="h-10 md:h-12" />
            <a href="mailto:support@aicapitalraising.com" className="flex items-center gap-2 text-sm transition-colors hover:opacity-80" style={{ color: mutedFg }}>
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">support@aicapitalraising.com</span>
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24" style={{ background: `linear-gradient(135deg, hsl(0 0% 4%) 0%, hsl(142 71% 5%) 50%, hsl(0 0% 4%) 100%)` }}>
          <div className="container mx-auto grid items-center gap-10 px-4 md:grid-cols-2 md:px-8">
            <div className="space-y-6">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: mutedFg }}>THE #1 AI-DRIVEN CAPITAL RAISING SYSTEM</p>
              <h1 className="font-heading text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
                AI Capital Raising <span style={{ color: green }}>Playbook</span>
              </h1>
              <p className="text-lg leading-relaxed md:text-xl">
                How to Raise <span className="font-bold" style={{ color: green }}>$5M to $100M</span> Using an <span style={{ color: green }}>AI-Driven System</span> That Attracts Accredited Investors on Autopilot
              </p>
              <p style={{ color: mutedFg }}>
                Discover the <span className="underline">cutting-edge capital raising strategies</span> that top funds and startups are using to secure millions—without relying on personal networks, cold outreach, or expensive brokers.
              </p>
              <CTAButton />
            </div>
            <div className="flex justify-center">
              <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67ad6436773f0202312de872.png" alt="AI Capital Raising Playbook Book" className="w-full max-w-md drop-shadow-2xl md:max-w-lg" />
            </div>
          </div>
        </section>

        {/* Inside Playbook */}
        <section className="py-16 md:py-24" style={{ backgroundColor: bg }}>
          <div className="container mx-auto px-4 text-center md:px-8">
            <p className="mx-auto mb-8 max-w-3xl font-heading text-sm font-semibold uppercase tracking-wider md:text-base" style={{ color: mutedFg }}>
              If you've been frustrated with slow capital raises, wasted time pitching to the wrong people, or unpredictable investor interest, you're not alone.
            </p>
            <h2 className="mb-12 font-heading text-3xl font-extrabold md:text-5xl">Inside this playbook, you'll discover:</h2>
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              {discoverItems.map((item, i) => (
                <div key={i} className="rounded-xl p-6 text-left" style={{ backgroundColor: cardBg, border: `1px solid ${borderC}` }}>
                  <CheckCircle className="mb-4 h-8 w-8" style={{ color: green }} />
                  <p className="text-base font-medium leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-2 text-center">
              <p><strong>No more uncertainty</strong> about where your next round of funding is coming from.</p>
              <p><strong>No more relying</strong> on personal networks that quickly dry up.</p>
              <p><strong>No more hoping</strong> that a broker will find investors for you.</p>
              <p className="mt-4" style={{ color: mutedFg }}>Instead, you'll learn <strong style={{ color: fg }}>a systemized approach that works predictably</strong>—whether you're raising <strong>$1M or $100M.</strong></p>
            </div>
            <div className="mt-10"><CTAButton /></div>
          </div>
        </section>

        {/* Why Traditional Fails */}
        <section className="py-16 md:py-24" style={{ backgroundColor: cardBg }}>
          <div className="container mx-auto grid items-center gap-12 px-4 md:grid-cols-2 md:px-8">
            <div>
              <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67ae70487322557fbe14f604.png" alt="AI Robot" className="mx-auto max-w-xs md:max-w-sm" />
            </div>
            <div className="space-y-6">
              <h2 className="font-heading text-3xl font-extrabold md:text-4xl">
                Why Traditional Capital Raising Strategies Fail <span style={{ color: green }}>(And What to Do Instead)</span>
              </h2>
              <p style={{ color: mutedFg }}>Before we dive into the AI-driven framework, it's important to understand why most capital raising efforts stall or fail completely:</p>
              <ul className="space-y-4">
                {failReasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: green }} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <h3 className="font-heading text-2xl font-extrabold md:text-3xl">The solution?</h3>
                <p className="mt-2 text-lg font-semibold">A fully automated, AI-powered investor acquisition system.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Perfect For */}
        <section className="py-16 md:py-24" style={{ backgroundColor: bg }}>
          <div className="container mx-auto px-4 text-center md:px-8">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: mutedFg }}>PROCESS</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-5xl">This playbook is perfect for:</h2>
            <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
              {audiences.map((a, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${borderC}` }}>
                    <img src={a.img} alt={a.title} loading="lazy" width={512} height={512} className="h-40 w-full object-cover md:h-48" />
                  </div>
                  <h3 className="font-heading text-sm font-bold md:text-base">{a.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Three Steps */}
        <section className="py-16 md:py-24" style={{ backgroundColor: cardBg }}>
          <div className="container mx-auto px-4 text-center md:px-8">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: mutedFg }}>The AI Capital Raising Framework:</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-5xl">The 3-Step System to Attract & Secure Accredited Investors</h2>
            <p className="mx-auto mt-4 max-w-3xl" style={{ color: mutedFg }}>
              This framework has been used to raise over <strong style={{ color: green }} className="italic">$7M in just 5 months</strong> for a real estate fund.
            </p>
            <div className="mt-12 space-y-10 text-left">
              {steps.map((s) => (
                <div key={s.number} className="rounded-2xl p-6 md:p-10" style={{ backgroundColor: bg, border: `1px solid ${borderC}` }}>
                  <h3 className="font-heading text-2xl font-extrabold md:text-3xl">
                    <span style={{ color: green }}>Step {s.number}:</span> {s.title}
                  </h3>
                  <ul className="mt-6 space-y-3">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: green }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 rounded-lg p-4" style={{ backgroundColor: elevatedBg }}>
                    <p style={{ color: mutedFg }}>💡 <strong style={{ color: fg }}>Real-World Example: </strong>{s.example}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12"><CTAButton /></div>
          </div>
        </section>

        {/* Why You Need */}
        <section className="py-16 md:py-24" style={{ backgroundColor: bg }}>
          <div className="container mx-auto px-4 text-center md:px-8">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: mutedFg }}>WHY YOU NEED THIS</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-5xl">What Happens When You Implement This?</h2>
            <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
              <div className="rounded-2xl p-6 text-left" style={{ backgroundColor: cardBg, border: `1px solid ${borderC}` }}>
                {cons.map((c, i) => (
                  <p key={i} className="mb-3 flex items-start gap-3" style={{ color: mutedFg }}>
                    <span className="shrink-0">❌</span> {c}
                  </p>
                ))}
              </div>
              <div className="rounded-2xl p-6 text-left" style={{ backgroundColor: cardBg, border: `1px solid ${green}` }}>
                {pros.map((p, i) => (
                  <p key={i} className="mb-3 flex items-start gap-3">
                    <span className="shrink-0">{p.icon}</span> {p.text}
                  </p>
                ))}
              </div>
            </div>
            <p className="mx-auto mt-10 max-w-2xl text-lg">This is <strong>not just theory</strong>—this is a proven, scalable system used to raise <strong>millions</strong>.</p>
            <div className="mt-8"><CTAButton /></div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 md:py-24" style={{ backgroundColor: cardBg }}>
          <div className="container mx-auto px-4 md:px-8">
            <div className="mx-auto max-w-4xl rounded-3xl p-8 md:p-12" style={{ backgroundColor: bg, border: `1px solid ${borderC}` }}>
              <div className="grid items-center gap-10 md:grid-cols-2">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/3b47f04b-8523-4abf-973c-72dc50a14f39.png" alt="Stars" className="h-6" />
                    <span className="text-sm" style={{ color: mutedFg }}>4.9/5 star reviews from 500+ couples</span>
                  </div>
                  <h2 className="font-heading text-3xl font-extrabold md:text-4xl">AI Capital Raising Playbook</h2>
                  <p className="mt-2" style={{ color: mutedFg }}>Unlock the Complete System (Ads, Funnels, Investor Email Templates & More).</p>
                  <div className="mt-6 flex gap-4">
                    <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67ad6436773f0202312de872.png" alt="Book" className="h-32 md:h-40" />
                    <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67ae70487322557fbe14f604.png" alt="AI" className="h-32 md:h-40" />
                  </div>
                </div>
                <div className="rounded-2xl p-6" style={{ backgroundColor: cardBg, border: `1px solid ${green}`, boxShadow: `0 0 30px hsl(142 71% 45% / 0.3), 0 0 60px hsl(142 71% 45% / 0.1)` }}>
                  <h3 className="font-heading text-xl font-bold">Here's what you get:</h3>
                  <p className="mt-1 text-sm" style={{ color: mutedFg }}>Includes:</p>
                  <ul className="mt-4 space-y-3">
                    {pricingIncludes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: green }} />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 text-center">
                    <p className="text-sm" style={{ color: mutedFg }}>Today Just</p>
                    <p className="font-heading text-4xl font-extrabold" style={{ color: green }}>
                      $27 <span className="text-base font-normal" style={{ color: mutedFg }}>one time</span>
                    </p>
                  </div>
                  <div className="mt-6"><CTAButton className="w-full text-center" /></div>
                </div>
              </div>
            </div>

            {/* Featured testimonial */}
            <div className="mx-auto mt-12 max-w-3xl rounded-2xl p-6 md:p-8" style={{ backgroundColor: bg, border: `1px solid ${borderC}` }}>
              <div className="flex items-start gap-4">
                <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67b2b11870fcfe34f6264444.png" alt="Testimonial" className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <p className="font-heading text-lg font-bold">"Game-Changer for Our Fund"</p>
                  <p className="mt-2 text-sm italic" style={{ color: mutedFg }}>"We struggled for months trying to raise capital the traditional way. After implementing this playbook, we secured $500K in commitments within 60 days."</p>
                  <p className="mt-3 text-sm font-semibold" style={{ color: green }}>— Vanessa L., Real Estate Syndicator</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24" style={{ backgroundColor: bg }}>
          <div className="container mx-auto px-4 text-center md:px-8">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: mutedFg }}>TESTIMONIALS</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-5xl">See How Other People Saved Thousands</h2>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <div key={i} className="rounded-2xl p-6 text-left" style={{ backgroundColor: cardBg, border: `1px solid ${borderC}` }}>
                  <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/7e8d238f-262a-4578-9584-868f586cf85c.png" alt={t.author} className="mb-4 h-16 w-16 rounded-full object-cover" />
                  <h3 className="font-heading text-lg font-bold">{t.title}</h3>
                  <p className="mt-3 text-sm italic" style={{ color: mutedFg }}>{t.quote}</p>
                  <p className="mt-4 text-sm font-semibold" style={{ color: green }}>— {t.author}</p>
                </div>
              ))}
            </div>
            <div className="mt-12"><CTAButton /></div>
          </div>
        </section>

        {/* Guarantee */}
        <section className="py-16 md:py-24" style={{ backgroundColor: cardBg }}>
          <div className="container mx-auto px-4 text-center md:px-8">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: mutedFg }}>STILL NOT SURE?</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-5xl">Our Ironclad 100% Risk-Free Guarantee</h2>
            <div className="mx-auto mt-10 grid max-w-4xl items-center gap-10 md:grid-cols-2">
              <div className="space-y-4 text-left" style={{ color: mutedFg }}>
                <p>We are so confident in the <strong style={{ color: fg }}>AI Capital Raising Playbook</strong> that we're putting our money where our mouth is.</p>
                <p>If you implement the strategies and don't see a measurable increase in investor interest within 60 days, we'll refund 100% of your investment—no questions asked.</p>
                <p className="font-semibold" style={{ color: fg }}>That's how much we believe in this system.</p>
              </div>
              <div className="flex justify-center">
                <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/662a0e2ded5f234b9ce5379c.jpeg" alt="Guarantee Badge" className="max-w-xs" />
              </div>
            </div>
            <div className="mt-10"><CTAButton /></div>
            <p className="mt-4 text-sm" style={{ color: mutedFg }}>Take action today—your next investor is waiting.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24" style={{ backgroundColor: bg }}>
          <div className="container mx-auto px-4 text-center md:px-8">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: mutedFg }}>STILL GOT QUESTIONS?</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-5xl">Frequently Asked Questions</h2>
            <div className="mx-auto mt-12 max-w-3xl text-left">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl px-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderC}` }}>
                    <AccordionTrigger className="font-heading text-base font-semibold hover:no-underline">{faq.q}</AccordionTrigger>
                    <AccordionContent style={{ color: mutedFg }}>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24" style={{ backgroundColor: cardBg }}>
          <div className="container mx-auto px-4 text-center md:px-8">
            <h2 className="font-heading text-3xl font-extrabold md:text-5xl">Enroll now before it's too late!</h2>
            <p className="mx-auto mt-4 max-w-2xl" style={{ color: mutedFg }}>Lock in your access to the complete system for just $27 before this special offer expires.</p>
            <div className="mt-8"><CTAButton /></div>
            <p className="mt-4 text-sm font-semibold" style={{ color: green }}>Price going up soon!</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8" style={{ backgroundColor: bg }}>
          <div className="container mx-auto flex flex-col items-center gap-4 px-4 md:px-8">
            <img src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/ZcPPQTHBxBWlnM1WyjvU/media/67bbe9a01cc1bb195ccebb93.png" alt="AI Capital Raising" className="h-10" />
            <p className="text-xs" style={{ color: mutedFg }}>© {new Date().getFullYear()} AI Capital Raising. All rights reserved.</p>
          </div>
        </footer>
      </div>
      <AccessFormDialog open={open} onOpenChange={setOpen} />
    </AccessFormContext.Provider>
  );
};

export default Playbook;
