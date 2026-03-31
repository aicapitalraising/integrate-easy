import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import logo from '@/assets/logo-aicra.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ApplyCTA() {
  return (
    <div className="text-center my-12">
      <Button
        size="lg"
        className="text-lg px-10 py-6 font-bold"
        onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}
      >
        Apply Now <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" /> Your information is secure. We will never sell or distribute your information.
      </p>
    </div>
  );
}

export default function SalesLetter() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/start');
  };

  return (
    <>
      <Helmet>
        <title>AI Capital Raising — Fill Your Fund With Accredited Investors</title>
        <meta name="description" content="We built an AI system that fills your fund with accredited investors while you spend less than 1 hour per week on marketing." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border py-6">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <img src={logo} alt="AI Capital Raising" className="h-8 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground italic max-w-xl mx-auto">
              "At scale, raising capital for an alternative investment fund isn't a distribution problem — it's a systems problem."
            </p>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12 space-y-0">
          {/* Hero */}
          <motion.section variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-foreground">
              We Built An AI System That Fills Your Fund With Accredited Investors While You Spend Less Than 1 Hour Per Week On Marketing.{' '}
              <span className="text-primary">We Build It. You Close The Deals.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Fill your calendar with QUALIFIED investor discovery calls while spending less than 1 hour per week on marketing… stop chasing referrals and cold outreach… finally raise capital for your fund predictably and at scale without burning out.
            </p>
            <ApplyCTA />
          </motion.section>

          {/* Letter Body */}
          <motion.section variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6 text-foreground leading-relaxed text-[17px]">
            <p className="text-xl font-semibold">Dear fund manager,</p>
            <p>
              My name is Zac Tavenner. We've helped <strong>47+ alternative investment funds</strong> raise over <strong>$600M</strong> from accredited investors using paid ads…
            </p>
            <p>
              And more importantly… we've done it across real estate, oil & gas, private equity, and venture capital funds (i.e. it works across asset classes).
            </p>
            <p>
              If you manage an alternative investment fund and you want a predictable, scalable system for attracting accredited investors…
            </p>
            <h2 className="text-2xl md:text-3xl font-bold pt-6">
              …then this is the most important page you will read today.
            </h2>
            <p>
              Because on this page, I'm going to show you the exact system we use to fill the calendars of fund managers with qualified investor discovery calls — without them having to chase referrals, attend conferences, or rely on broker-dealers.
            </p>
          </motion.section>

          {/* The Problem */}
          <motion.section variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="pt-16 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">The Problem With How Most Fund Managers Raise Capital Today</h2>
            <p className="text-[17px] leading-relaxed text-foreground">Most people assume that to raise capital for a fund, you need:</p>
            <ul className="space-y-3 text-[17px] text-foreground">
              {[
                'A massive personal network of HNW individuals',
                'Broker-dealers charging 5–10% success fees',
                'In-person investor events and roadshows',
                'Or constant cold outreach and referral chasing',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-destructive mt-1 font-bold">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-[17px] leading-relaxed text-foreground">
              But none of those fix the real problem… Because they don't scale predictably. Most capital raising approaches are "leaky buckets" that lose prospects at every step.
            </p>
            <p className="text-[17px] leading-relaxed text-foreground font-medium">
              Your problem is not a "network" problem. It's that qualified investors haven't been pre-educated on your fund.
            </p>
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg">
              <p className="font-semibold text-foreground mb-2">When you fix that:</p>
              <ol className="list-decimal list-inside space-y-1 text-foreground">
                <li>Cost per qualified investor drops</li>
                <li>Commitment rates go up</li>
              </ol>
            </div>
          </motion.section>

          {/* The Solution */}
          <motion.section variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="pt-16 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">Here's The Solution</h2>
            <p className="text-[17px] leading-relaxed text-foreground">
              That's why we use a simple <strong>AI-powered investor acquisition system</strong> which uses data to identify accredited investors actively looking for alternative investments, then positions your fund as the obvious choice. It educates. Filters. Qualifies. Then books investor discovery calls on your calendar.
            </p>
            <p className="text-[17px] leading-relaxed text-foreground">
              Once it's live, it takes about an hour per week to manage. The best part? <strong>It works FAST!</strong> You will get your first investor discovery call within 7–10 days. And investors will come to your calls already educated on your fund, your track record, and your thesis.
            </p>
            <p className="text-[17px] leading-relaxed text-foreground font-medium">
              This is not fantasy. It's real, it works, and is the ONLY investor acquisition system you need for raising capital at scale. We build the system. We launch the ads. You take the calls.
            </p>
          </motion.section>

          {/* Qualification Box */}
          <motion.section variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="pt-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">But This Is NOT For Everyone</h2>
            <div className="border-l-4 border-primary bg-primary/5 p-8 rounded-r-lg space-y-4">
              <p className="font-semibold text-foreground text-lg">You MUST meet three criteria:</p>
              <ol className="space-y-3 text-foreground text-[17px]">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">1.</span>
                  <span>You have an active alternative investment fund (real estate, oil & gas, PE, VC, or similar)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">2.</span>
                  <span>You know your ideal accredited investor profile</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">3.</span>
                  <span>You are ready to run paid ads to attract investors at scale</span>
                </li>
              </ol>
              <p className="text-foreground">
                If you meet all three criteria above, then keep reading — because what comes next will show you exactly how we do it.
              </p>
            </div>
          </motion.section>

          {/* 4-Step Process */}
          <motion.section variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="pt-16 space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center">Here's How It Works (4 Simple Steps)</h2>
            <div className="grid gap-6">
              {[
                {
                  step: 1,
                  title: 'We Build Your AI-Powered Investor Acquisition System',
                  desc: 'We build a complete investor funnel — landing page, VSL, pitch deck integration, and automated follow-up sequences. The system speaks directly to your ideal accredited investor and is designed to pre-qualify prospects so you only speak with serious, ready-to-invest leads.',
                },
                {
                  step: 2,
                  title: 'We Launch Paid Ads Across Meta, Google, LinkedIn & YouTube',
                  desc: 'We set up and launch a multi-channel paid ad campaign targeting accredited investors by digital behavior signals. We start with 3–5 proven ad angles we know work across 47+ funds so we find a winning campaign that generates qualified investor leads within 7–10 days.',
                },
                {
                  step: 3,
                  title: 'We Generate Qualified Investor Discovery Calls For You',
                  desc: 'The system filters out unaccredited and unqualified prospects automatically and books qualified investor discovery calls on your calendar daily. Our AI SMS setter and AI caller handles all follow-up — 80%+ of commitments come after 5+ touchpoints, all handled automatically.',
                },
                {
                  step: 4,
                  title: 'You Close Capital Commitments',
                  desc: 'You speak only with pre-educated accredited investors who are ready to learn more about your fund. Expect significantly higher commitment rates than cold outreach or referral-based approaches.',
                },
              ].map((s) => (
                <div key={s.step} className="border border-border bg-card rounded-xl p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="bg-primary text-primary-foreground font-bold text-sm w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                      {s.step}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold">{s.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Funnel Diagram */}
          <motion.section variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="pt-16">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
              {['AI Ads', 'Investor Funnel', 'Discovery Call', 'Capital Commitment'].map((label, i) => (
                <div key={label} className="flex items-center">
                  <div className="bg-primary/10 border border-primary/30 text-primary font-semibold px-6 py-3 rounded-lg text-center text-sm">
                    {label}
                  </div>
                  {i < 3 && <ArrowRight className="h-5 w-5 text-primary mx-2 hidden md:block" />}
                </div>
              ))}
            </div>
          </motion.section>

          <ApplyCTA />

          {/* Checklist */}
          <motion.section variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="pt-8 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">This Is Perfect For You If…</h2>
            <ul className="space-y-4">
              {[
                'You have a fund with a strong track record and a compelling investment thesis…',
                'You know you could be raising far more capital, but you rely on referrals and a limited personal network…',
                "You've tried other approaches (broker-dealers, investor conferences, cold outreach, LinkedIn prospecting, referral networks)…",
                "You haven't found anything that consistently delivers accredited investor meetings at scale…",
                'You want investors who arrive pre-educated and ready to commit — without you having to educate them from scratch on every call…',
                'You want to be raising capital consistently every month without burning out or depending on your network…',
                'You have a fund that delivers real returns and deserves to be fully subscribed…',
                'You want to spend your time managing investments and delivering returns — not chasing investors…',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[17px] text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Testimonials */}
          <motion.section variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="pt-16 space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center">Real Results From Real Funds</h2>
            <div className="grid gap-6">
              {[
                {
                  type: 'REAL ESTATE FUND',
                  headline: 'We helped Marcus close $2.4M in a 90-day multifamily raise',
                  quote: 'We had our first investor discovery call booked within 48 hours of launch. The quality of investors coming through was unlike anything we\'d seen from our previous approaches.',
                },
                {
                  type: 'OIL & GAS FUND',
                  headline: 'We helped a Texas-based O&G fund raise $8M in a single offering',
                  quote: 'The AI follow-up sequences alone were worth it. Investors were showing up to calls already convinced — we just had to answer questions and close.',
                },
                {
                  type: 'PRIVATE EQUITY FUND',
                  headline: 'We helped a PE fund generate 47 qualified investor meetings in 30 days',
                  quote: '47 qualified investor meetings in the first month. Our previous approach generated maybe 5–6 per month through referrals. The difference is night and day.',
                },
              ].map((t) => (
                <div key={t.type} className="border border-border bg-card rounded-xl p-6 md:p-8">
                  <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">{t.type}</span>
                  <h3 className="text-lg font-bold mt-2 mb-3">{t.headline}</h3>
                  <p className="text-muted-foreground italic">"{t.quote}"</p>
                </div>
              ))}
            </div>
          </motion.section>

          <ApplyCTA />

          {/* Closing Letter */}
          <motion.section variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="pt-8 space-y-4 text-[17px] text-foreground leading-relaxed">
            <p>
              ALL of this matters… the alternative investment space is getting more competitive every year… and you need to ENSURE that your fund is positioned as the BEST option for accredited investors in your asset class.
            </p>
            <p>
              It all begins with one AI-powered investor acquisition system that clearly explains what your fund does and PRE-FILTERS for your perfect fit investors…
            </p>
            <p>So go ahead and apply without further ado…</p>
            <p className="pt-4">I'll speak with you soon.</p>
            <p className="font-medium">
              Yours Sincerely,<br />
              <span className="text-lg font-bold">Zac Tavenner</span>
            </p>
          </motion.section>

          {/* Apply Form */}
          <motion.section id="apply" variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="pt-16 pb-8">
            <div className="border border-border bg-card rounded-xl p-8 md:p-12 max-w-lg mx-auto">
              <h2 className="text-2xl font-bold text-center mb-2">Apply Now</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">Please Submit Accurate Information</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">First Name</label>
                  <Input
                    placeholder="Your first name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Business Email Address</label>
                  <Input
                    type="email"
                    placeholder="you@yourbusiness.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Cell Phone</label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full text-lg font-bold py-6">
                  See If You Qualify <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" /> Your information is secure.
              </p>
            </div>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8 bg-muted/30">
          <div className="max-w-3xl mx-auto px-6 text-center space-y-3">
            <p className="text-xs text-muted-foreground">AI Capital Raising is a division of High Performance Ads</p>
            <div className="flex justify-center gap-4">
              <span className="text-xs text-muted-foreground">Privacy Policy</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">Terms</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">Contact</span>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AI Capital Raising • All Rights Reserved</p>
          </div>
        </footer>
      </div>
    </>
  );
}
