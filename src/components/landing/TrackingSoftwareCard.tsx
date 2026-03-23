import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';

interface KPI {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend: number; // percentage change
  status: 'green' | 'red' | 'neutral';
}

const kpis: KPI[] = [
  { label: 'Total Ad Spend', value: 47250, prefix: '$', suffix: '', decimals: 0, trend: 12, status: 'neutral' },
  { label: 'CTR', value: 3.8, prefix: '', suffix: '%', decimals: 1, trend: 14, status: 'green' },
  { label: 'Leads', value: 1247, prefix: '', suffix: '', decimals: 0, trend: 23, status: 'green' },
  { label: 'Cost Per Lead', value: 37.89, prefix: '$', suffix: '', decimals: 2, trend: -8, status: 'green' },
  { label: 'Booked Calls', value: 312, prefix: '', suffix: '', decimals: 0, trend: 31, status: 'green' },
  { label: 'Cost Per Call', value: 151.44, prefix: '$', suffix: '', decimals: 2, trend: -12, status: 'green' },
  { label: 'Show Rate', value: 68, prefix: '', suffix: '%', decimals: 0, trend: 5, status: 'green' },
  { label: 'Commitments', value: 47, prefix: '', suffix: '', decimals: 0, trend: 18, status: 'green' },
  { label: 'Commitment $', value: 4.7, prefix: '$', suffix: 'M', decimals: 1, trend: 22, status: 'green' },
  { label: 'Funded Investors', value: 31, prefix: '', suffix: '', decimals: 0, trend: 15, status: 'green' },
  { label: 'Funded $', value: 3.2, prefix: '$', suffix: 'M', decimals: 1, trend: 19, status: 'green' },
  { label: 'Cost of Capital', value: 1.48, prefix: '', suffix: '%', decimals: 2, trend: -6, status: 'green' },
];

function KPICard({ kpi, index }: { kpi: KPI; index: number }) {
  const { ref, isVisible } = useScrollAnimation(0.3);
  const count = useCountUp(kpi.value, 2000 + index * 100, isVisible, kpi.decimals);

  const formatValue = () => {
    if (kpi.value >= 1000 && !kpi.suffix) {
      return `${kpi.prefix}${count.toLocaleString()}`;
    }
    return `${kpi.prefix}${count}${kpi.suffix}`;
  };

  const TrendIcon = kpi.trend > 0 ? TrendingUp : kpi.trend < 0 ? TrendingDown : Minus;
  const trendColor = kpi.status === 'green' ? 'text-emerald-500' : kpi.status === 'red' ? 'text-red-500' : 'text-muted-foreground';
  const borderColor = kpi.status === 'green' ? 'border-emerald-500/20' : kpi.status === 'red' ? 'border-red-500/20' : 'border-border';

  return (
    <div
      ref={ref}
      className={`rounded-lg border ${borderColor} bg-card p-3 transition-all duration-300 hover:shadow-sm`}
    >
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 truncate">{kpi.label}</p>
      <p className="font-display text-lg font-bold text-foreground leading-tight">{formatValue()}</p>
      <div className={`flex items-center gap-1 mt-1 ${trendColor}`}>
        <TrendIcon className="w-3 h-3" />
        <span className="text-[10px] font-medium">{kpi.trend > 0 ? '+' : ''}{kpi.trend}% vs prior</span>
      </div>
    </div>
  );
}

export default function TrackingSoftwareCard() {
  return (
    <motion.div
      className="max-w-md mx-auto glass-card rounded-2xl p-4 overflow-hidden animate-enrichment-glow"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-foreground">Performance Dashboard</p>
          <p className="text-[10px] text-muted-foreground">Live KPIs • Mar 1 – Mar 22, 2026</p>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-medium">Live</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.label} kpi={kpi} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
