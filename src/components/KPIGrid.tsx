import React from 'react';
import { ProductionRow, DepartmentFilter } from '../types';

interface KPIGridProps {
  data: ProductionRow[];
  dept: DepartmentFilter;
}

export default function KPIGrid({ data, dept }: KPIGridProps) {
  const sumPL_A = data.reduce((s, r) => s + r.pl_a, 0);
  const sumPL_B = data.reduce((s, r) => s + r.pl_b, 0);
  const sumPL = dept === 'A' ? sumPL_A : dept === 'B' ? sumPL_B : sumPL_A + sumPL_B;

  const sumLoss_A = data.reduce((s, r) => s + r.dl_a + r.bm_a + r.stl_a + r.oth_a, 0);
  const sumLoss_B = data.reduce((s, r) => s + r.dl_b + r.bm_b + r.stl_b + r.oth_b, 0);
  const sumLoss = dept === 'A' ? sumLoss_A : dept === 'B' ? sumLoss_B : sumLoss_A + sumLoss_B;

  const sumPD_A = data.reduce((s, r) => s + r.pd_a, 0);
  const sumPD_B = data.reduce((s, r) => s + r.pd_b, 0);
  const sumPD = dept === 'A' ? sumPD_A : dept === 'B' ? sumPD_B : sumPD_A + sumPD_B;

  // Compute average OEE (across non-zero readings on furnace 1..4)
  const activeOEERows = data.filter(r => (r.oee1 + r.oee2 + r.oee3 + r.oee4) > 0);
  const oeeAvg = activeOEERows.length
    ? activeOEERows.reduce((acc, r) => {
        const activeVals = [r.oee1, r.oee2, r.oee3, r.oee4].filter(v => v > 0);
        const rowAvg = activeVals.length ? activeVals.reduce((a, b) => a + b, 0) / activeVals.length : 0;
        return acc + rowAvg;
      }, 0) / activeOEERows.length
    : 0;

  const lossPct = sumPL > 0 ? ((sumLoss / sumPL) * 100).toFixed(1) : '—';
  
  // Custom formatters
  const fmt = (n: number) => n.toLocaleString('th-TH');
  const fmtK = (n: number) => {
    if (!n) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  // Color mappings
  const getLossColor = (pctStr: string) => {
    const pct = parseFloat(pctStr);
    if (isNaN(pct)) return '#94a3b8';
    if (pct > 15) return '#ff5e7e'; // rose/red
    if (pct > 8) return '#f5a623';   // amber/warning
    return '#C4A661';              // elegant gold
  };

  const getOEEColor = (val: number) => {
    if (val >= 80) return '#C4A661'; // gold
    if (val >= 65) return '#d4b671'; // lighter gold/amber
    return '#ff5e7e';
  };

  const lossColor = getLossColor(lossPct);
  const oeeColor = getOEEColor(oeeAvg);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* KPI 1: Plan run duration */}
      <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-[#C4A661]/35 transition-colors">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C4A661] opacity-70" />
        <div className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">
          แผนเดินเครื่องรวม ({dept === 'all' ? 'A+B' : dept === 'A' ? 'ฝ่าย A' : 'ฝ่าย B'})
        </div>
        <div className="text-3xl font-serif font-medium text-[#e8eaf2] flex items-baseline">
          {fmt(sumPL)}
          <span className="text-sm font-sans font-normal text-white/40 ml-1">ชม.</span>
        </div>
        <div className="text-xs text-white/50 mt-2 flex items-center justify-between">
          <span className="text-white/30">{data.length} เดือน</span>
          <span className="text-white/30 font-mono">A: {fmt(sumPL_A)} / B: {fmt(sumPL_B)}</span>
        </div>
      </div>

      {/* KPI 2: Total loss duration */}
      <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-[#C4A661]/35 transition-colors">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#8E793E] opacity-70" />
        <div className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">
          เวลาสูญเสียรวม ({dept === 'all' ? 'A+B' : dept === 'A' ? 'ฝ่าย A' : 'ฝ่าย B'})
        </div>
        <div className="text-3xl font-serif font-medium text-[#e8eaf2] flex items-baseline">
          {fmt(sumLoss)}
          <span className="text-sm font-sans font-normal text-white/40 ml-1">ชม.</span>
        </div>
        <div className="text-xs text-white/50 mt-2 flex items-center gap-1.5 flex-wrap">
          <span 
            className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-sm"
            style={{ backgroundColor: `${lossColor}1a`, color: lossColor, border: `1px solid ${lossColor}33` }}
          >
            {lossPct}%
          </span>
          <span className="text-white/30">ของแผนเดินเครื่อง</span>
        </div>
      </div>

      {/* KPI 3: Production piececount */}
      <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-[#C4A661]/35 transition-colors">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C4A661]/40 opacity-70" />
        <div className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">
          จำนวนการผลิตรวม ({dept === 'all' ? 'PD:A+B' : dept === 'A' ? 'ฝ่าย A' : 'ฝ่าย B'})
        </div>
        <div className="text-3xl font-serif font-medium text-[#e8eaf2] flex items-baseline">
          {fmtK(sumPD)}
          <span className="text-sm font-sans font-normal text-white/40 ml-1">ชิ้น</span>
        </div>
        <div className="text-xs text-white/30 mt-2 flex justify-between font-mono">
          <span>ฝ่าย A: {fmtK(sumPD_A)}</span>
          <span>ฝ่าย B: {fmtK(sumPD_B)}</span>
        </div>
      </div>

      {/* KPI 4: Mean OEE over active ovens */}
      <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-5 relative overflow-hidden group hover:border-[#C4A661]/35 transition-colors">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C4A661] opacity-70" />
        <div className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-2">
          OEE เฉลี่ย (ทุกเตา)
        </div>
        <div className="text-3xl font-serif font-medium text-[#e8eaf2] flex items-baseline">
          {oeeAvg ? oeeAvg.toFixed(1) : '—'}
          <span className="text-sm font-sans font-normal text-white/40 ml-1">%</span>
        </div>
        <div className="text-xs text-white/50 mt-2 flex items-center gap-1.5">
          <span 
            className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-sm uppercase"
            style={{ backgroundColor: `${oeeColor}1a`, color: oeeColor, border: `1px solid ${oeeColor}33` }}
          >
            {oeeAvg >= 80 ? 'ดีเยี่ยม' : oeeAvg >= 65 ? 'ปานกลาง' : 'ปรับปรุง'}
          </span>
          <span className="text-white/30">เตาที่กำลังทำงาน</span>
        </div>
      </div>
    </div>
  );
}
