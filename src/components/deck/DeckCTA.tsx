import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import logo from '@/assets/logo-aicra.png';

const timelineSteps = [
  { label: 'Proposal', active: true },
  { label: 'Onboarding', active: false },
  { label: 'Access', active: false },
  { label: 'Kickoff Call', active: false },
];

export default function DeckCTA() {
  useEffect(() => {
    if (!document.querySelector('script[src="https://go.nurtureking.com/js/form_embed.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://go.nurtureking.com/js/form_embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section className="py-24 md:py-32 px-6 border-t border-border">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <img src={logo} alt="AI Capital Raising Accelerator" className="h-12 mx-auto mb-8" />
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 text-foreground">
            Ready to <span className="gradient-text">Raise Capital</span> at Scale?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Fill out your details below and we'll send you a contract to get started.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="glass-card rounded-2xl p-6 md:p-8 mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-5 text-center">Next Steps</p>
          <div className="relative flex items-center justify-between">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
            <div className="absolute top-4 left-0 w-[8%] h-0.5 bg-primary" />
            {timelineSteps.map((step) => (
              <div key={step.label} className="relative flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.active
                    ? 'bg-primary shadow-[0_0_12px_4px_hsl(var(--primary)/0.4)] animate-pulse'
                    : 'bg-muted border-2 border-border'
                }`}>
                  {step.active ? (
                    <Check className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <span className={`mt-2 text-xs font-display font-semibold ${step.active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* GHL Form */}
        <motion.div
          className="glass-card rounded-2xl p-8 md:p-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <iframe
            src="https://go.nurtureking.com/widget/form/ukzbdRhLG4XjYppsVRKL"
            style={{ width: '100%', height: '957px', border: 'none', borderRadius: '3px' }}
            id="inline-ukzbdRhLG4XjYppsVRKL"
            data-layout='{"id":"INLINE"}'
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
        </motion.div>
      </div>
    </section>
  );
}
