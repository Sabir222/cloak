'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';
import { useTranslations } from 'next-intl';
import { AnimatedNumber } from '@/components/ui/animated-number';

type StatItem = {
  value: number;
  label: string;
  svg: string;
  suffix?: string;
};

export function AnimatedStats({
  personaCount,
  packCount,
  divisionCount
}: {
  personaCount: number;
  packCount: number;
  divisionCount: number;
}) {
  const t = useTranslations('landing');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const stats: StatItem[] = [
    { value: personaCount, label: t('statAgents'), svg: '/square.svg', suffix: '+' },
    { value: packCount, label: t('statPacks'), svg: '/rectangle.svg' },
    { value: divisionCount, label: t('statDivisions'), svg: '/triangle.svg' },
  ];

  return (
    <div ref={ref} className="grid grid-cols-3 gap-8">
      {stats.map(({ value, label, svg, suffix }) => (
        <StatCard key={label} value={value} label={label} svg={svg} suffix={suffix} inView={inView} />
      ))}
    </div>
  );
}

function StatCard({
  value,
  label,
  svg,
  suffix,
  inView
}: {
  value: number;
  label: string;
  svg: string;
  suffix?: string;
  inView: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (inView) {
      setDisplayValue(value);
    }
  }, [inView, value]);

  return (
    <div className="text-center">
      <div className="flex justify-center mb-3">
        <img src={svg} alt="" className="w-12 h-12" aria-hidden="true" />
      </div>
      <div className="text-3xl font-bold text-gray-900">
        <AnimatedNumber
          value={displayValue}
          springOptions={{ bounce: 0, duration: 2000 }}
        />
        {suffix}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}