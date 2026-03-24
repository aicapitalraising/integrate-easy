import { Facebook, Search, PenTool, FileText, CheckCircle, Rocket, Settings, ExternalLink, Globe, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const onboardingSteps = [
  { step: 1, title: 'Research', description: 'We conduct research based on your product/service to determine the best offer.', icon: Search },
  { step: 2, title: 'Funnel', description: 'We will create a funnel to generate leads/sales for your business.', icon: Settings },
  { step: 3, title: 'Creatives', description: 'We design ad graphics for your products/service. We may request videos depending on your offer.', icon: PenTool },
  { step: 4, title: 'Copywriting', description: 'Our copywriters will produce scroll-stopping copy.', icon: FileText },
  { step: 5, title: 'Approval', description: 'We will ask for approval on our advertising campaign to launch.', icon: CheckCircle },
  { step: 6, title: 'Launch', description: 'Campaigns will go live & this will determine our 1st month starting date!', icon: Rocket },
];

const fbSteps = [
  { step: 1, title: 'Go To Business Settings → People', description: 'Go to Business Settings → People and add access to your advertising data.', cta: { label: 'Go To Ads Manager', url: 'https://business.facebook.com/settings/people' } },
  { step: 2, title: 'Go To Business Settings → Add People', description: 'Navigate to your Business Settings and select "Add People" to grant access.' },
  { step: 3, title: 'Add Our Team With Admin Permissions', description: 'Add the following emails with full admin access.' },
];

const newAccountSteps = [
  { step: 1, title: 'Create a new Business Manager', description: 'Go to business.facebook.com and create a new business manager.', url: 'https://business.facebook.com' },
  { step: 2, title: 'Create a new FB Page', description: 'Business Settings → Accounts → Pages → Add → Create new page. Assign partner ID: 1590591514320671' },
  { step: 3, title: 'Create a new FB Ad Account', description: 'Business Settings → Accounts → Ad Accounts → Add → Create. Assign partner ID: 1590591514320671. Add a payment method.' },
  { step: 4, title: 'Create a new FB Pixel', description: 'Business Settings → Data Sources → Pixels → Add. Assign partner ID: 1590591514320671' },
];

export default function AccessTab() {
  return (
    <div className="space-y-16">
      {/* What Happens Next */}
      <section>
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">What Happens Next</h2>
          <p className="text-muted-foreground text-sm mt-1">Our 6-step onboarding process to get your campaigns live.</p>
          <div className="luxury-divider mt-4" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {onboardingSteps.map((s) => (
            <div
              key={s.step}
              className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary tracking-wider uppercase">Step {s.step}</span>
              </div>
              <h3 className="font-display text-base font-semibold text-foreground mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Facebook Access */}
      <section>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[hsl(220,80%,50%)]/10 flex items-center justify-center">
              <Facebook className="w-5 h-5 text-[hsl(220,80%,50%)]" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Facebook Access</h2>
          </div>
          <p className="text-muted-foreground text-sm">Grant access to your Facebook ad accounts so we can manage campaigns.</p>
          <div className="luxury-divider mt-4 mx-0" />
        </div>

        <div className="space-y-4 mb-10">
          {fbSteps.map((s) => (
            <div key={s.step} className="flex gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-all">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                {s.step}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display text-sm font-semibold text-foreground">{s.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                {s.step === 3 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">zactavenner@gmail.com</code>
                    <span className="text-xs text-muted-foreground self-center">(Full Admin Access)</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">ads@highperformanceads.com</code>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">emily@highperformanceads.com</code>
                  </div>
                )}
                {s.cta && (
                  <a href={s.cta.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                    <Button size="sm" variant="outline" className="text-xs gap-1.5">
                      <ExternalLink className="w-3 h-3" /> {s.cta.label}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* New accounts */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="font-display text-base font-semibold text-foreground mb-1">Don't have an account?</h3>
          <p className="text-xs text-muted-foreground mb-5">Follow these steps to create new Facebook business assets.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {newAccountSteps.map((s) => (
              <div key={s.step} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{s.step}</span>
                  <h4 className="font-display text-sm font-semibold text-foreground">{s.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7">
                      <ExternalLink className="w-3 h-3" /> Open
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Access */}
      <section>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[hsl(4,80%,50%)]/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[hsl(4,80%,50%)]" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Google Access</h2>
          </div>
          <div className="luxury-divider mt-4 mx-0" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <ol className="space-y-3 text-sm text-foreground list-decimal list-inside">
            <li>Send Us Your Google Ads ID, and we will request access.</li>
            <li>Add the following emails with admin access:
              <div className="mt-2 flex flex-wrap gap-2 ml-5">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">zac@highperformanceads.com</code>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">ads@highperformanceads.com</code>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">emily@highperformanceads.com</code>
              </div>
            </li>
            <li>Notify Our Team Once Completed.</li>
          </ol>
        </div>
      </section>

    </div>
  );
}
