import { useEffect } from 'react';
import logo from '@/assets/logo-aicra.png';
import { Shield, Clock, Video, CheckCircle2 } from 'lucide-react';

export default function ReviewCall() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://go.nurtureking.com/js/form_embed.js';
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <header className="bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/"><img src={logo} alt="AI Capital Raising Accelerator" className="h-7" /></a>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>256-bit encrypted</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-2xl border border-border shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border bg-muted/30 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" /> Client Review
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Schedule Your Review Call
              </h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
                Book a time to review your campaign assets, creatives, and strategy with our team.
              </p>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row">
              {/* Sidebar details */}
              <div className="lg:w-72 shrink-0 p-6 lg:p-8 lg:border-r border-border">
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">AI Capital Raising</span>
                    <h3 className="text-lg font-bold text-foreground mt-1 leading-tight">Client Review Call</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Walk through your campaign assets, provide feedback, and align on next steps.
                    </p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <span>30 Minutes</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4 text-primary" />
                      </div>
                      <span>Zoom Video Call</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-2">What we'll cover:</h4>
                    <ul className="space-y-2">
                      {[
                        'Review ad creatives & copy',
                        'Walk through funnel & landing pages',
                        'Discuss targeting & audience strategy',
                        'Approve assets for launch',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Calendar embed */}
              <div className="flex-1 p-2 md:p-4">
                <iframe
                  src="https://go.nurtureking.com/widget/booking/AXJdWpt2P6kEdOg3DSNB"
                  style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
                  scrolling="no"
                  id="OYS6jYrAHMWG8uWYguD3_1774637716671"
                  title="Schedule Client Review Call"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
