import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { 
  Wrench, 
  Clock, 
  Percent, 
  Package, 
  Layers, 
  Thermometer, 
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { ProductionRow, DepartmentFilter, MONTHS_TH, ViewTab } from '../types';

interface DashboardChartsProps {
  data: ProductionRow[];
  dept: DepartmentFilter;
  tab: ViewTab;
}

export default function DashboardCharts({ data, dept, tab }: DashboardChartsProps) {
  // Translate labels and project chart properties
  const chartData = data.map(r => {
    const lossA = r.dl_a + r.bm_a + r.stl_a + r.oth_a;
    const lossB = r.dl_b + r.bm_b + r.stl_b + r.oth_b;
    const pdA_tons = r.pd_a / 1000;
    const pdB_tons = r.pd_b / 1000;
    const pdTotal_tons = (r.pd_a + r.pd_b) / 1000;
    return {
      name: MONTHS_TH[r.month] || r.month,
      month: r.month,
      'PL:A': r.pl_a,
      'PL:B': r.pl_b,
      'Loss:A': lossA,
      'Loss:B': lossB,
      'PD:A': pdA_tons,
      'PD:B': pdB_tons,
      'PD:Total': pdTotal_tons,
      'RM:A': r.rm_a / 1000,
      'RM:B': r.rm_b / 1000,
      pdA_tons,
      pdB_tons,
      pdTotal_tons,
    };
  });

  // Calculate Breakdown of Total Losses for Pie Chart
  const totDL = data.reduce((s, r) => s + (dept !== 'B' ? r.dl_a : 0) + (dept !== 'A' ? r.dl_b : 0), 0);
  const totBM = data.reduce((s, r) => s + (dept !== 'B' ? r.bm_a : 0) + (dept !== 'A' ? r.bm_b : 0), 0);
  const totSTL = data.reduce((s, r) => s + (dept !== 'B' ? r.stl_a : 0) + (dept !== 'A' ? r.stl_b : 0), 0);
  const totOTH = data.reduce((s, r) => s + (dept !== 'B' ? r.oth_a : 0) + (dept !== 'A' ? r.oth_b : 0), 0);
  const totalDowntime = totDL + totBM + totSTL + totOTH;

  const lossBreakdown = [
    { name: 'รอวัตถุดิบ (DL)', value: totDL, color: '#3B82F6' }, // Blue
    { name: 'ซ่อมบำรุง / รั่วไหล (BM)', value: totBM, color: '#F97316' }, // Orange
    { name: 'เริ่มเดินเครื่อง (STL)', value: totSTL, color: '#10B981' }, // Green
    { name: 'อื่นๆ (OTH)', value: totOTH, color: '#8B5CF6' } // Purple
  ];

  // Specific variables for loss statistics
  const monthlyLossesVal = data.map(r => ({
    name: MONTHS_TH[r.month] || r.month,
    lossA: r.dl_a + r.bm_a + r.stl_a + r.oth_a,
    lossB: r.dl_b + r.bm_b + r.stl_b + r.oth_b,
  }));

  const highestLossA = [...monthlyLossesVal].sort((a, b) => b.lossA - a.lossA)[0] || { name: '—', lossA: 0 };
  const highestLossB = [...monthlyLossesVal].sort((a, b) => b.lossB - a.lossB)[0] || { name: '—', lossB: 0 };

  // Specific variables for production statistics
  const totPD_A = data.reduce((s, r) => s + r.pd_a, 0);
  const totPD_B = data.reduce((s, r) => s + r.pd_b, 0);
  const totRM_A = data.reduce((s, r) => s + r.rm_a, 0);
  const totRM_B = data.reduce((s, r) => s + r.rm_b, 0);

  const yieldA = totRM_A > 0 ? (totPD_A / totRM_A).toFixed(3) : '0';
  const yieldB = totRM_B > 0 ? (totPD_B / totRM_B).toFixed(3) : '0';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0D0D0F] border border-white/10 p-3 rounded-md shadow-lg text-xs font-sans">
          <p className="font-bold text-[#e8eaf2] mb-1 font-serif">{label}</p>
          {payload.map((item: any, i: number) => {
            const isTon = item.name.includes('ตัน') || item.name.includes('Ratio') || item.name.includes('Yield') || item.name.toLowerCase().includes('pd') || item.name.toLowerCase().includes('rm');
            const isHour = item.name.includes('แผน') || item.name.includes('สูญเสีย') || item.name.includes('ชั่วโมง') || item.name.toLowerCase().includes('pl') || item.name.toLowerCase().includes('loss');
            
            const unit = isTon ? 'ตัน' : (isHour ? 'ชม.' : '');
            
            const formatted = typeof item.value === 'number'
              ? item.value.toLocaleString('th-TH', { 
                  minimumFractionDigits: isTon ? 1 : 0, 
                  maximumFractionDigits: isTon ? 3 : 1 
                })
              : item.value;
            return (
              <div key={i} className="flex justify-between gap-6 py-0.5" style={{ color: item.color || item.fill }}>
                <span className="font-medium text-white/50">{item.name}:</span>
                <span className="font-mono font-semibold text-right">
                  {formatted} {unit}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Specific output variables for overview production chart
  const overviewPD_A = data.reduce((s, r) => s + r.pd_a, 0) / 1000;
  const overviewPD_B = data.reduce((s, r) => s + r.pd_b, 0) / 1000;
  const overviewPD_Total = dept === 'A' ? overviewPD_A : dept === 'B' ? overviewPD_B : overviewPD_A + overviewPD_B;
  const overviewAvgMonthly = data.length > 0 ? overviewPD_Total / data.length : 0;

  // Custom Dynamic Tooltip for Monthly Production Output Chart
  const ProductionOverviewTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      if (!dataPoint) return null;

      const pdA = typeof dataPoint.pdA_tons === 'number' ? dataPoint.pdA_tons : (dataPoint['PD:A'] || 0);
      const pdB = typeof dataPoint.pdB_tons === 'number' ? dataPoint.pdB_tons : (dataPoint['PD:B'] || 0);
      const pdTotal = typeof dataPoint.pdTotal_tons === 'number' ? dataPoint.pdTotal_tons : (pdA + pdB);

      return (
        <div className="bg-[#0D0D0F] border border-[#C4A661]/35 p-3.5 rounded-xl shadow-2xl text-xs min-w-[220px] space-y-2.5 font-sans">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-serif font-bold text-[#e8eaf2] text-sm">
              เดือน {label} ({dataPoint.month})
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#C4A661]/10 text-[#C4A661] border border-[#C4A661]/25">
              หน่วย: ตัน
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11.5px]">
            {dept !== 'B' && (
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB] inline-block shrink-0" />
                  <span className="font-sans text-white/70">ฝ่ายผลิต A:</span>
                </div>
                <span className="font-bold text-[#60A5FA]">
                  {pdA.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ตัน
                </span>
              </div>
            )}

            {dept !== 'A' && (
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#F97316] inline-block shrink-0" />
                  <span className="font-sans text-white/70">ฝ่ายผลิต B:</span>
                </div>
                <span className="font-bold text-[#FB923C]">
                  {pdB.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ตัน
                </span>
              </div>
            )}

            <div className="border-t border-white/10 pt-2 flex justify-between items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#C4A661] inline-block shrink-0" />
                <span className="font-sans font-semibold text-white/90">
                  {dept === 'all' ? 'ยอดรวม (A+B):' : dept === 'A' ? 'ยอดรวม ฝ่าย A:' : 'ยอดรวม ฝ่าย B:'}
                </span>
              </div>
              <span className="font-bold text-[#D4B671]">
                {(dept === 'A' ? pdA : dept === 'B' ? pdB : pdTotal).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ตัน
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render view conditionally to achieve strict separation and maximum clarity
  if (tab === 'overview') {
    return (
      <div className="flex flex-col gap-5">
        {/* Full screen wide Area Chart covering Planning & General Losses */}
        <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-sm font-semibold text-[#e8eaf2] font-serif flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C4A661]" />
                <span>แผนการเดินเครื่องกับชั่วโมงสูญเสียสะสม</span>
              </div>
              <div className="text-xs text-white/40">ภาพรวมเชิงเปรียบเทียบระหว่างเวลาทำงานตามเป้าหมาย (Plan) กับเวลาสูญเสียจากอุปสรรคชะงักงัน (Loss)</div>
            </div>
            {/* Legend indicators */}
            <div className="flex gap-4 items-center text-[11px] font-mono">
              {dept !== 'B' && (
                <>
                  <div className="flex items-center gap-1.5 text-[#2563EB]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB] inline-block" />
                    <span>PL:A (ชั่วโมงแผน)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#38BDF8]">
                    <span className="w-2.5 h-1.5 rounded-xs border-t-2 border-dashed border-[#38BDF8] inline-block" />
                    <span>Loss:A (ชั่วโมงสูญเสีย)</span>
                  </div>
                </>
              )}
              {dept !== 'A' && (
                <>
                  <div className="flex items-center gap-1.5 text-[#F97316]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#F97316] inline-block" />
                    <span>PL:B (ชั่วโมงแผน)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#EF4444]">
                    <span className="w-2.5 h-1.2 rounded-xs border-t-2 border-dashed border-[#EF4444] inline-block" />
                    <span>Loss:B (ชั่วโมงสูญเสีย)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPlB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickFormatter={(val) => `${val} ชม.`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {dept !== 'B' && (
                  <Area 
                    type="monotone" 
                    dataKey="PL:A" 
                    name="แผนการทำงาน ฝ่าย A" 
                    stroke="#2563EB" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPlA)" 
                  />
                )}
                {dept !== 'B' && (
                  <Area 
                    type="monotone" 
                    dataKey="Loss:A" 
                    name="เวลาสูญเสีย ฝ่าย A" 
                    stroke="#38BDF8" 
                    strokeDasharray="4 3"
                    strokeWidth={2}
                    fill="none" 
                  />
                )}
                
                {dept !== 'A' && (
                  <Area 
                    type="monotone" 
                    dataKey="PL:B" 
                    name="แผนการทำงาน ฝ่าย B" 
                    stroke="#F97316" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPlB)" 
                  />
                )}
                {dept !== 'A' && (
                  <Area 
                    type="monotone" 
                    dataKey="Loss:B" 
                    name="เวลาสูญเสีย ฝ่าย B" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    fill="none" 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Production Output Chart (placed right below Plan vs Loss Chart) */}
        <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            <div>
              <div className="text-sm font-semibold text-[#e8eaf2] font-serif flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C4A661]" />
                <span>กราฟแสดงยอดการผลิตรายเดือน (Monthly Production Output)</span>
              </div>
              <div className="text-xs text-white/40">
                เปรียบเทียบปริมาณผลผลิตจริงระหว่างฝ่าย A และฝ่าย B รายเดือน (หน่วย: ตัน)
              </div>
            </div>

            {/* Legend indicators */}
            <div className="flex gap-4 items-center text-[11px] font-mono flex-wrap">
              {dept !== 'B' && (
                <div className="flex items-center gap-1.5 text-[#38BDF8]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB] inline-block" />
                  <span>ฝ่ายผลิต A (ตัน)</span>
                </div>
              )}
              {dept !== 'A' && (
                <div className="flex items-center gap-1.5 text-[#FB923C]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#F97316] inline-block" />
                  <span>ฝ่ายผลิต B (ตัน)</span>
                </div>
              )}
              {dept === 'all' && (
                <div className="flex items-center gap-1.5 text-[#C4A661]">
                  <span className="w-3.5 h-1 rounded-full bg-[#C4A661] inline-block" />
                  <span>ยอดผลิตรวม A+B (ตัน)</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.75} />
                  </linearGradient>
                  <linearGradient id="barGradB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FB923C" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickFormatter={(val) => `${Number(val).toLocaleString('th-TH')} ตัน`}
                />
                <Tooltip content={<ProductionOverviewTooltip />} />

                {dept !== 'B' && (
                  <Bar 
                    dataKey="PD:A" 
                    name="ฝ่ายผลิต A (ตัน)" 
                    fill="url(#barGradA)" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={45}
                  />
                )}
                {dept !== 'A' && (
                  <Bar 
                    dataKey="PD:B" 
                    name="ฝ่ายผลิต B (ตัน)" 
                    fill="url(#barGradB)" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={45}
                  />
                )}
                {dept === 'all' && (
                  <Line 
                    type="monotone" 
                    dataKey="PD:Total" 
                    name="ยอดรวม A+B (ตัน)" 
                    stroke="#C4A661" 
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#C4A661', stroke: '#0D0D0F', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#D4B671', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Bar underneath chart */}
          <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#0A0A0B] border border-white/5 rounded-lg p-2.5">
              <span className="text-[10px] text-white/40 block uppercase tracking-wider">
                ยอดผลิตรวมช่วงที่เลือก
              </span>
              <span className="text-sm font-bold font-mono text-[#e8eaf2]">
                {overviewPD_Total.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xs font-normal text-white/40">ตัน</span>
              </span>
            </div>

            <div className="bg-[#0A0A0B] border border-white/5 rounded-lg p-2.5">
              <span className="text-[10px] text-white/40 block uppercase tracking-wider">
                เฉลี่ยต่อเดือน
              </span>
              <span className="text-sm font-bold font-mono text-[#C4A661]">
                {overviewAvgMonthly.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-xs font-normal text-white/40">ตัน/เดือน</span>
              </span>
            </div>

            {dept === 'all' ? (
              <div className="bg-[#0A0A0B] border border-white/5 rounded-lg p-2.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-white/40 block uppercase tracking-wider">
                  สัดส่วนผลผลิต ฝ่าย A / B
                </span>
                <span className="text-xs font-bold font-mono text-white/80">
                  <span className="text-[#38BDF8]">
                    {((overviewPD_A / (overviewPD_A + overviewPD_B || 1)) * 100).toFixed(1)}%
                  </span>
                  {' / '}
                  <span className="text-[#FB923C]">
                    {((overviewPD_B / (overviewPD_A + overviewPD_B || 1)) * 100).toFixed(1)}%
                  </span>
                </span>
              </div>
            ) : (
              <div className="bg-[#0A0A0B] border border-white/5 rounded-lg p-2.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-white/40 block uppercase tracking-wider">
                  สถานะตัวกรองแผนก
                </span>
                <span className="text-xs font-bold font-mono text-[#C4A661]">
                  กำลังแสดงเฉพาะฝ่าย {dept}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'loss') {
    return (
      <div className="flex flex-col gap-6">
        {/* Loss specific dashboard views */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart displaying type breakdowns */}
          <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-sm font-semibold text-[#e8eaf2] font-serif flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C4A661]" />
                <span>โครงสร้างและสัดส่วนชั่วโมงสูญเสีย</span>
              </div>
              <div className="text-xs text-white/40 mb-3">จำแนกสาเหตุพฤติกรรมประวิงเวลาและความล้มเหลว (%)</div>
            </div>

            <div className="h-48 relative flex items-center justify-center my-1">
              {totalDowntime > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lossBreakdown.filter(x => x.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {lossBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} ชม.`, 'รวมเวลาสูญเสีย']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-white/35 text-center">ไม่มีสถิติชั่วโมงสูญเสียบันทึกในระบบ</div>
              )}
              {totalDowntime > 0 && (
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest leading-none">สะสมรวม</span>
                  <span className="text-xl font-bold text-[#e8eaf2] font-mono mt-1">{totalDowntime.toLocaleString('th-TH')}h</span>
                </div>
              )}
            </div>

            <div className="space-y-2 mt-2">
              {lossBreakdown.map((item, i) => {
                const pct = totalDowntime > 0 ? ((item.value / totalDowntime) * 100).toFixed(1) : '0';
                return (
                  <div key={i} className="flex justify-between items-center p-2 bg-[#0A0A0B] border border-white/5 rounded-md text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-white/70">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold" style={{ color: item.color }}>
                      {pct}% <span className="text-[10px] text-white/30 font-normal">({item.value} ชม.)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Series comparison focused strictly on Monthly Loss Duration */}
          <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-5 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="text-sm font-semibold text-[#e8eaf2] font-serif flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C4A661]" />
                <span>ชั่วโมงสูญเสียรายแผนกรายเดือน (Loss comparison)</span>
              </div>
              <div className="text-xs text-white/40 mb-3">เปรียบเทียบชั่วโมงการหยุดทำงานขัดข้องระหว่างฝ่าย A และฝ่าย B รายเดือน</div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickFormatter={(val) => `${val} ชม.`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  
                  {dept !== 'B' && (
                    <Bar 
                      dataKey="Loss:A" 
                      name="ชั่วโมงสูญเสีย ฝ่าย A" 
                      fill="#2563EB" 
                      radius={[3, 3, 0, 0]} 
                    />
                  )}
                  {dept !== 'A' && (
                    <Bar 
                      dataKey="Loss:B" 
                      name="ชั่วโมงสูญเสีย ฝ่าย B" 
                      fill="#F97316" 
                      radius={[3, 3, 0, 0]} 
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Micro insights summarizing findings dynamically for loss */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/5">
              {dept !== 'B' && (
                <div className="p-2 bg-[#0A0A0B] border border-white/5 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] shrink-0 text-xs">
                    💡
                  </div>
                  <div className="text-[11px] leading-tight">
                    <span className="font-semibold text-white/50 block">วิเคราะห์พีคสูญเสียสูงสุด ฝ่ายอบ A</span>
                    เกิดในเดือน <span className="text-[#2563EB] font-bold">{highestLossA.name}</span> ปริมาณหยุดเดินเครื่องรวม <span className="text-[#2563EB] font-mono font-bold">{highestLossA.lossA} ชม.</span>
                  </div>
                </div>
              )}
              {dept !== 'A' && (
                <div className="p-2 bg-[#0A0A0B] border border-white/5 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F97316]/10 flex items-center justify-center text-[#F97316] shrink-0 text-xs">
                    ⏳
                  </div>
                  <div className="text-[11px] leading-tight">
                    <span className="font-semibold text-white/50 block">วิเคราะห์พีคสูญเสียสูงสุด ฝ่ายอบ B</span>
                    เกิดในเดือน <span className="text-[#F97316] font-bold">{highestLossB.name}</span> ปริมาณหยุดเดินเครื่องรวม <span className="text-[#F97316] font-mono font-bold">{highestLossB.lossB} ชม.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render SPECIFIC PRODUCTION target view (tab === 'production')
  return (
    <div className="flex flex-col gap-6 animate-in fade-in-20 duration-200">
      {/* Target output vs Raw Material input graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* PD: Production volume bar chart */}
        <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-5">
          <div className="mb-4">
            <div className="text-sm font-semibold text-[#e8eaf2] font-serif flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C4A661]" />
              <span>จำนวนการผลิตรวมสะสม (Production Output - PD)</span>
            </div>
            <div className="text-xs text-white/40">ปริมาณการผลิตรายเดือนจำแนกตามฝ่าย (หน่วย: ตัน)</div>
          </div>
 
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickFormatter={(val) => `${val} ตัน`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                
                {dept !== 'B' && (
                  <Bar 
                    dataKey="PD:A" 
                    name="ฝ่ายผลิต A (ตัน)" 
                    fill="#2563EB" 
                    radius={[4, 4, 0, 0]} 
                  />
                )}
                {dept !== 'A' && (
                  <Bar 
                    dataKey="PD:B" 
                    name="ฝ่ายผลิต B (ตัน)" 
                    fill="#EF4444" 
                    radius={[4, 4, 0, 0]} 
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        {/* RM: Raw materials handled bar chart */}
        <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-5">
          <div className="mb-4">
            <div className="text-sm font-semibold text-[#e8eaf2] font-serif flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#06B6D4]" />
              <span>น้ำหนักวัตถุดิบที่ใช้เตรียมการผลิต (Raw Material - RM)</span>
            </div>
            <div className="text-xs text-white/40">น้ำหนักวัตถุดิบป้อนเข้าเครื่องจักรเพื่อการแปรผลผลิต (หน่วย: ตัน)</div>
          </div>
 
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickFormatter={(val) => `${val} ตัน`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                
                {dept !== 'B' && (
                  <Bar 
                    dataKey="RM:A" 
                    name="วัตถุดิบป้อน ฝ่าย A (ตัน)" 
                    fill="#06B6D4" 
                    radius={[4, 4, 0, 0]} 
                  />
                )}
                {dept !== 'A' && (
                  <Bar 
                    dataKey="RM:B" 
                    name="วัตถุดิบป้อน ฝ่าย B (ตัน)" 
                    fill="#F97316" 
                    radius={[4, 4, 0, 0]} 
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
 
      {/* Dynamic Conversion Ratio Efficiency dashboard card (Yield analysis) */}
      <div className="bg-[#0D0D0F] border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-[#C4A661]" />
          <div>
            <span className="text-sm font-semibold text-[#e8eaf2] font-serif block">วิเคราะห์ประสิทธิภาพแปรสภาพผลผลิต (Yield and Conversion Index)</span>
            <span className="text-xs text-white/40">คำนวณอัตราความแม่นยำในการเปลี่ยนน้ำหนักวัตถุดิบ 1 ตันเป็นหน่วยสินค้าที่เสร็จสมบูรณ์ (ตันสำเร็จ / ตันวัตถุดิบ)</span>
          </div>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {dept !== 'B' && (
            <div className="p-4 bg-[#0A0A0B] border border-white/5 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/60">อัตรารับผลตอบแทน ฝ่าย A (Ratio A)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/25">เสถียรภาพ</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-semibold font-mono text-[#2563EB]">{yieldA}</span>
                <span className="text-xs text-white/30 font-sans">ตันสำเร็จ ต่อ 1 ตันวัตถุดิบ</span>
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed mt-1">
                จากปริมาณการผลิตสะสม {(totPD_A / 1000).toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ตัน ภายใต้การเตรียมใช้ส่วนผสมป้อนเตาจำนวน {(totRM_A / 1000).toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ตัน
              </p>
            </div>
          )}
 
          {dept !== 'A' && (
            <div className="p-4 bg-[#0A0A0B] border border-white/5 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/60">อัตรารับผลตอบแทน ฝ่าย B (Ratio B)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/25">มีประสิทธิภาพ</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-semibold font-mono text-[#EF4444]">{yieldB}</span>
                <span className="text-xs text-white/30 font-sans">ตันสำเร็จ ต่อ 1 ตันวัตถุดิบ</span>
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed mt-1">
                จากปริมาณการผลิตสะสม {(totPD_B / 1000).toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ตัน ภายใต้การเตรียมใช้ส่วนผสมป้อนเตาจำนวน {(totRM_B / 1000).toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} ตัน
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
