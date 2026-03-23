import { useEffect } from 'react';
import logo from '@/assets/logo-aicra.png';

export default function Start() {
  useEffect(() => {
    // Load GHL form embed script
    const script = document.createElement('script');
    script.src = 'https://go.nurtureking.com/js/form_embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-center">
          <a href="/"><img src={logo} alt="AI Capital Raising" className="h-8" /></a>
        </div>
      </header>

      <div className="flex-1 px-4 py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Get Started
            </h1>
            <p className="text-sm text-muted-foreground">
              Fill out the form below to begin your AI-powered capital raising campaign.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-2 md:p-4">
            <iframe
              src="https://go.nurtureking.com/widget/form/ukzbdRhLG4XjYppsVRKL"
              style={{ width: '100%', height: '957px', border: 'none', borderRadius: '3px' }}
              id="inline-ukzbdRhLG4XjYppsVRKL"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="AI Capital Raising Internal Contract Form"
              data-height="957"
              data-layout-iframe-id="inline-ukzbdRhLG4XjYppsVRKL"
              data-form-id="ukzbdRhLG4XjYppsVRKL"
              title="AI Capital Raising Internal Contract Form"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
