import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ProductionRow, MONTHS_TH } from '../types';

interface DataTableProps {
  data: ProductionRow[];
}

export default function DataTable({ data }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Suffix formatters
  const fmtK = (n: number) => {
    if (!n) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const filteredRows = data.filter(r => {
    const monthTH = MONTHS_TH[r.month] || '';
    const query = searchQuery.trim().toLowerCase();
    return (
      !query ||
      r.month.toLowerCase().includes(query) ||
      monthTH.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-[#0D0D0F] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="text-sm font-semibold text-[#e8eaf2] font-serif">ข้อมูลผลผลิตและการสูญเสียรายเดือน</div>
          <div className="text-xs text-white/40">ข้อมูลเตาม้วน บรรจุภัณฑ์ และอุปกรณ์หลัก</div>
        </div>
        
        {/* Search tool */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเดือน (เช่น ม.ค., JAN)..."
            className="w-full bg-[#0A0A0B] border border-white/10 rounded-md py-1.5 pl-9 pr-4 text-xs font-sans text-[#e8eaf2] outline-none focus:border-[#C4A661] focus:ring-1 focus:ring-[#C4A661] transition-all placeholder-white/20"
          />
        </div>
      </div>

      {/* Responsive Wrapper Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#0A0A0B] border-b border-white/10">
              <th className="p-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">เดือน</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider bg-white/5">PL:A</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider bg-white/5">DL:A</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider bg-white/5">BM:A</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider bg-white/5">STL:A</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider bg-white/5">OTH:A</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider bg-white/10">PL:B</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider bg-white/10">DL:B</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider bg-white/10">BM:B</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider bg-white/10">STL:B</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider bg-white/10">OTH:B</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider">OEE#1</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider">OEE#2</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider">OEE#3</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider">OEE#4</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider text-[#C4A661]">PD:A</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider text-[#D4B671]">PD:B</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider text-[#8E793E]">RM:A</th>
              <th className="p-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider text-[#A3A3A3]">RM:B</th>
              <th className="p-3 text-center text-[10px] font-bold text-white/40 uppercase tracking-wider">สถานะ</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-white/10">
            {filteredRows.length > 0 ? (
              filteredRows.map((r, idx) => {
                const activeOvens = [r.oee1, r.oee2, r.oee3, r.oee4].filter(v => v > 0);
                const oeeAvg = activeOvens.length ? activeOvens.reduce((a, b) => a + b, 0) / activeOvens.length : 0;
                
                let ratingClass = 'text-white/30 bg-white/5 border border-white/10';
                let ratingText = 'ไม่มีข้อมูล';
                
                if (r.pl_a !== 0 || r.pl_b !== 0) {
                  if (oeeAvg >= 80) {
                    ratingClass = 'text-[#C4A661] bg-[#C4A661]/10 border border-[#C4A661]/25';
                    ratingText = 'ดีเยี่ยม';
                  } else if (oeeAvg >= 65) {
                    ratingClass = 'text-[#D4B671] bg-[#D4B671]/10 border border-[#D4B671]/25';
                    ratingText = 'ปานกลาง';
                  } else {
                    ratingClass = 'text-[#ff5e7e] bg-[#ff5e7e]/10 border border-[#ff5e7e]/25';
                    ratingText = 'ปรับปรุง';
                  }
                }

                return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-xs font-bold text-[#e8eaf2] font-mono tracking-wider">
                      {MONTHS_TH[r.month] || r.month}
                    </td>
                    <td className="p-3 text-right text-xs font-mono text-white/40 bg-white/5">{r.pl_a || '—'}</td>
                    <td className="p-3 text-right text-xs font-mono text-white/40 bg-white/5">{r.dl_a || '—'}</td>
                    <td className="p-3 text-right text-xs font-mono text-white/40 bg-white/5">{r.bm_a || '—'}</td>
                    <td className="p-3 text-right text-xs font-mono text-white/40 bg-white/5">{r.stl_a || '—'}</td>
                    <td className="p-3 text-right text-xs font-mono text-white/40 bg-white/5">{r.oth_a || '—'}</td>
                    
                    <td className="p-3 text-right text-xs font-mono text-white/40 bg-white/10">{r.pl_b || '—'}</td>
                    <td className="p-3 text-right text-xs font-mono text-white/40 bg-white/10">{r.dl_b || '—'}</td>
                    <td className="p-3 text-right text-xs font-mono text-white/40 bg-white/10">{r.bm_b || '—'}</td>
                    <td className="p-3 text-right text-xs font-mono text-white/40 bg-white/10">{r.stl_b || '—'}</td>
                    <td className="p-3 text-right text-xs font-mono text-white/40 bg-white/10">{r.oth_b || '—'}</td>
                    
                    <td className="p-3 text-right text-xs font-mono text-white/60">{r.oee1 > 0 ? r.oee1.toFixed(1) : '—'}</td>
                    <td className="p-3 text-right text-xs font-mono text-white/60">{r.oee2 > 0 ? r.oee2.toFixed(1) : '—'}</td>
                    <td className="p-3 text-right text-xs font-mono text-white/60">{r.oee3 > 0 ? r.oee3.toFixed(1) : '—'}</td>
                    <td className="p-3 text-right text-xs font-mono text-white/60">{r.oee4 > 0 ? r.oee4.toFixed(1) : '—'}</td>
                    
                    <td className="p-3 text-right text-xs font-mono font-medium text-[#C4A661]">{fmtK(r.pd_a)}</td>
                    <td className="p-3 text-right text-xs font-mono font-medium text-[#D4B671]">{fmtK(r.pd_b)}</td>
                    <td className="p-3 text-right text-xs font-mono text-[#8E793E]">{fmtK(r.rm_a)}</td>
                    <td className="p-3 text-right text-xs font-mono text-[#A3A3A3]">{fmtK(r.rm_b)}</td>
                    
                    <td className="p-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-sm border font-sans ${ratingClass}`}>
                        {ratingText}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={20} className="p-12 text-center text-sm text-white/30">
                  ไม่พบข้อมูลตามคำค้นหาที่ระบุ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
