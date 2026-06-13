import React from 'react';
import { ProductionRow } from '../types';

interface OEEOverviewProps {
  data: ProductionRow[];
}

export default function OEEOverview({ data }: OEEOverviewProps) {
  const ovens = [
    { name: 'เตาอบ 1', key: 'oee1' as const, color: '#C4A661', accent: '#C4A661' },
    { name: 'เตาอบ 2', key: 'oee2' as const, color: '#D4B671', accent: '#D4B671' },
    { name: 'เตาอบ 3', key: 'oee3' as const, color: '#A3A3A3', accent: '#A3A3A3' },
    { name: 'เตาอบ 4', key: 'oee4' as const, color: '#8E793E', accent: '#8E793E' }
  ];

  return (
    <div className="mb-6">
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
        OEE — ประสิทธิภาพโดยรวมของแต่ละเตาอบ
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ovens.map((ov, index) => {
          // Filter out months that don't have recorded OEE data for this oven
          const readings = data.map(r => r[ov.key]).filter(v => v > 0);
          const avg = readings.length ? readings.reduce((a, b) => a + b, 0) / readings.length : 0;
          const maxVal = readings.length ? Math.max(...readings) : 0;
          
          // Color coding based on targets (>=80% = gold, >=65% = soft gold, else red)
          const getStatusColors = (val: number) => {
            if (val === 0) return { text: '#454d66', bg: '#0A0A0B', bar: '#222' };
            if (val >= 80) return { text: '#C4A661', bg: '#C4A6611a', bar: '#C4A661' };
            if (val >= 65) return { text: '#D4B671', bg: '#D4B6711a', bar: '#D4B671' };
            return { text: '#ff5e7e', bg: '#ff5e7e1a', bar: '#ff5e7e' };
          };

          const sColor = getStatusColors(avg);
          const widthPct = Math.min(avg, 100).toFixed(0);

          return (
            <div 
              key={ov.key} 
              className="bg-[#0D0D0F] border border-white/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-[#C4A661]/35 transition-colors"
            >
              <div className="text-[11.5px] font-bold tracking-wider" style={{ color: ov.accent }}>
                {ov.name}
              </div>
              
              <div className="flex items-baseline gap-1">
                <div className="text-3xl font-serif font-medium transition-transform group-hover:scale-105 duration-200" style={{ color: sColor.text }}>
                  {avg > 0 ? avg.toFixed(1) : '—'}
                </div>
                {avg > 0 && <span className="text-sm font-semibold text-white/40">%</span>}
              </div>

              {/* Progress bar representing OEE percentage */}
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-800 ease-out" 
                  style={{ width: `${widthPct}%`, backgroundColor: sColor.bar }}
                />
              </div>

              <div className="text-[11px] text-white/30 flex justify-between items-center font-mono">
                <span>วัดผล {readings.length} เดือน</span>
                {avg > 0 && <span className="text-white/40">สูงสุด {maxVal.toFixed(1)}%</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
