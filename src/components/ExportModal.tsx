import React, { useState } from 'react';
import { Mail, FileText, ExternalLink, Copy, X, Check } from 'lucide-react';
import { ProductionRow, ExportType, MONTHS_TH } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProductionRow[];
  sheetId?: string;
  onShowToast: (msg: string, type: 'ok' | 'err') => void;
}

export default function ExportModal({
  isOpen,
  onClose,
  data,
  sheetId,
  onShowToast
}: ExportModalProps) {
  const [selectedType, setSelectedType] = useState<ExportType>('email');
  const [emailSubject, setEmailSubject] = useState('📊 รายงานข้อมูลการผลิต — PTM Agriculture');
  const [emailNote, setEmailNote] = useState('');

  if (!isOpen) return null;

  const targetEmail = 'oibomin.ptm@gmail.com';

  // Compute stats for summary card
  const totalPL = data.reduce((s, r) => s + r.pl_a + r.pl_b, 0);
  const totalLoss = data.reduce((s, r) => s + r.dl_a + r.bm_a + r.stl_a + r.oth_a + r.dl_b + r.bm_b + r.stl_b + r.oth_b, 0);
  const totalPD = data.reduce((s, r) => s + r.pd_a + r.pd_b, 0);

  const activeOvens = data.flatMap(r => [r.oee1, r.oee2, r.oee3, r.oee4].filter(v => v > 0));
  const oeeAvg = activeOvens.length ? (activeOvens.reduce((a, b) => a + b, 0) / activeOvens.length).toFixed(1) : '—';
  const todayDate = new Date().toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });

  // Generate CSV String
  const generateCSV = () => {
    const headers = [
      'เดือน', 'PL:A', 'DL:A', 'BM:A', 'STL:A', 'OTH:A',
      'PL:B', 'DL:B', 'BM:B', 'STL:B', 'OTH:B',
      'OEE#1', 'OEE#2', 'OEE#3', 'OEE#4',
      'PD:A', 'PD:B', 'RM:A', 'RM:B'
    ];
    
    const rows = data.map(r => [
      r.month, r.pl_a, r.dl_a, r.bm_a, r.stl_a, r.oth_a,
      r.pl_b, r.dl_b, r.bm_b, r.stl_b, r.oth_b,
      r.oee1.toFixed(2), r.oee2.toFixed(2), r.oee3.toFixed(2), r.oee4.toFixed(2),
      r.pd_a, r.pd_b, r.rm_a, r.rm_b
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const triggerCSVDownload = (csvText: string, filename: string) => {
    const bom = '\uFEFF'; // Excel Thai language support
    const blob = new Blob([bom + csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const generateEmailBodyText = () => {
    const lossPct = totalPL > 0 ? ((totalLoss / totalPL) * 100).toFixed(1) : '—';
    const detailRows = data.map(r => 
      `${r.month} | PL:A=${r.pl_a} PL:B=${r.pl_b} | Loss:A=${r.dl_a+r.bm_a+r.stl_a+r.oth_a} Loss:B=${r.dl_b+r.bm_b+r.stl_b+r.oth_b} | OEE: ${r.oee1.toFixed(1)}% ${r.oee2.toFixed(1)}% ${r.oee3.toFixed(1)}% ${r.oee4.toFixed(1)}% | PD:A=${r.pd_a.toLocaleString()} PD:B=${r.pd_b.toLocaleString()}`
    ).join('\n');

    return `สวัสดีครับ,

${emailNote ? emailNote + '\n\n' : ''}รายงานข้อมูลการผลิตประจำเดือน — PTM Agriculture
วันที่ออกรายงาน: ${new Date().toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}
จำนวนข้อมูล: ${data.length} เดือน

====================================
สรุปตัวชี้วัดหลักคีย์ดัชนี (KPI)
====================================
แผนการเดินเครื่องทั้งหมด : ${totalPL.toLocaleString('th-TH')} ชั่วโมง
เวลาการสูญเสียทั้งหมด   : ${totalLoss.toLocaleString('th-TH')} ชั่วโมง (${lossPct}%)
จำนวนการผลิตทั้งหมด   : ${totalPD.toLocaleString('th-TH')} ชิ้น
OEE ประสิทธิภาพเฉลี่ยรวม : ${oeeAvg}%

====================================
สถิติรายละเอียดรายเดือน
====================================
${detailRows}

====================================
** ข้อมูลฉบับเต็มแนบมาในไฟล์ CSV **
คุณสามารถนำเข้าไฟล์ CSV ลงใน Google Sheets:
เลือกที่ ไฟล์ > นำเข้า (File > Import) > อัปโหลดไฟล์

ด้วยความเคารพ,
ฝ่ายเทคโนโลยีอุตสาหกรรม PTM Agriculture
`;
  };

  const handleExportExecute = () => {
    const csvContent = generateCSV();

    if (selectedType === 'email') {
      try {
        // Download CSV first as helper
        triggerCSVDownload(csvContent, 'ptm_production_export.csv');
        
        // Open Gmail Composer Interface
        setTimeout(() => {
          const mailSubject = encodeURIComponent(emailSubject);
          const mailBody = encodeURIComponent(generateEmailBodyText());
          const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(targetEmail)}&su=${mailSubject}&body=${mailBody}`;
          window.open(gmailUrl, '_blank');
          onClose();
          onShowToast('ดาวน์โหลด CSV สำเร็จ & เริ่มคอมโพส Gmail แล้ว', 'ok');
        }, 500);
      } catch (err) {
        onShowToast('เกิดข้อผิดพลาดในการเปิด Gmail', 'err');
      }
    } else if (selectedType === 'csv') {
      try {
        triggerCSVDownload(csvContent, 'PTM_Production_Data.csv');
        onClose();
        onShowToast('ดาวน์โหลดไฟล์ CSV สำเร็จ', 'ok');
      } catch (err) {
        onShowToast('ไม่สามารถดาวน์โหลดไฟล์ได้', 'err');
      }
    } else if (selectedType === 'sheeturl') {
      if (sheetId) {
        window.open(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`, '_blank');
        onClose();
        onShowToast('กำลังเชื่อมต่อไปยังแผนงานชีต', 'ok');
      } else {
        onShowToast('ไม่พบคีย์ Google Sheet ID ที่ใช้เชื่อมต่อ', 'err');
      }
    } else if (selectedType === 'copy') {
      navigator.clipboard.writeText(csvContent).then(() => {
        onClose();
        onShowToast('คัดลอกข้อมูล CSV ลงในคลิปบอร์ดแล้ว', 'ok');
      }).catch(() => {
        onShowToast('คัดลอกข้อมูลไม่สำเร็จ', 'err');
      });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-[#0D0D0F] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header container */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[#C4A661] font-bold text-base font-serif">
            <Mail className="w-5 h-5 animate-pulse" />
            <span>ส่งออกและสรุปยอดข้อมูล</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/40 hover:text-[#e8eaf2] bg-[#0A0A0B] border border-white/10 hover:border-white/20 p-1.5 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body scroll area */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          
          {/* Summary Box */}
          <div className="bg-[#0A0A0B] border border-white/10 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">กรองเวลา</span>
              <span className="text-sm font-bold text-[#e8eaf2] font-mono">{data.length} เดือน</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">OEE เฉลี่ย</span>
              <span className="text-sm font-bold text-[#C4A661] font-mono">{oeeAvg}%</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">แผนเดินเครื่อง</span>
              <span className="text-sm font-bold text-[#e8eaf2] font-mono">{totalPL.toLocaleString('th-TH')} ชม.</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase font-bold tracking-widest text-white/30">วันที่บันทึก</span>
              <span className="text-sm font-semibold text-[#C4A661]">{todayDate}</span>
            </div>
          </div>

          {/* Export Mode selector */}
          <div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2.5">
              เลือกรูปแบบจัดส่ง / ส่งออก
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Type 1: Email */}
              <div 
                onClick={() => setSelectedType('email')}
                className={`p-3.5 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                  selectedType === 'email' 
                    ? 'border-[#C4A661] bg-[#C4A661]/10' 
                    : 'border-white/10 bg-[#0A0A0B] hover:border-white/20 hover:bg-[#111]'
                }`}
              >
                <div className="p-2 rounded-lg bg-[#C4A661]/10 text-[#C4A661] shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#e8eaf2]">เปิด Gmail ส่งถึงปลายทาง</div>
                  <div className="text-[11px] text-white/40 mt-1 leading-relaxed">
                    เตรียมส่งอีเมลสรุปข้อมูลแบบตอบกลับ และแนบไฟล์ CSV
                  </div>
                </div>
              </div>

              {/* Type 2: CSV pure download */}
              <div 
                onClick={() => setSelectedType('csv')}
                className={`p-3.5 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                  selectedType === 'csv' 
                    ? 'border-[#C4A661] bg-[#C4A661]/10' 
                    : 'border-white/10 bg-[#0A0A0B] hover:border-white/20 hover:bg-[#111]'
                }`}
              >
                <div className="p-2 rounded-lg bg-[#D4B671]/10 text-[#D4B671] shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#e8eaf2]">ดาวน์โหลดไฟล์ CSV (.csv)</div>
                  <div className="text-[11px] text-white/40 mt-1 leading-relaxed">
                    บันทึกไฟล์ข้อมูลเพื่อใช้ดูร่วมกับ Excel หรือชีตส่วนตัว
                  </div>
                </div>
              </div>

              {/* Type 3: Open Sheet link */}
              <div 
                onClick={() => setSelectedType('sheeturl')}
                className={`p-3.5 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                  selectedType === 'sheeturl' 
                    ? 'border-[#C4A661] bg-[#C4A661]/10' 
                    : 'border-white/10 bg-[#0A0A0B] hover:border-white/20 hover:bg-[#111]'
                }`}
              >
                <div className="p-2 rounded-lg bg-[#8E793E]/10 text-[#8E793E] shrink-0 mt-0.5">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#e8eaf2]">เปิดหน้า Google Sheets</div>
                  <div className="text-[11px] text-white/40 mt-1 leading-relaxed">
                    เข้าชมสเปรดชีตต้นฉบับในหน้าต่างเว็บเบราว์เซอร์ใหม่ทันที
                  </div>
                </div>
              </div>

              {/* Type 4: Copy to Clipboard */}
              <div 
                onClick={() => setSelectedType('copy')}
                className={`p-3.5 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                  selectedType === 'copy' 
                    ? 'border-[#C4A661] bg-[#C4A661]/10' 
                    : 'border-white/10 bg-[#0A0A0B] hover:border-white/20 hover:bg-[#111]'
                }`}
              >
                <div className="p-2 rounded-lg bg-[#A3A3A3]/20 text-[#A3A3A3] shrink-0 mt-0.5">
                  <Copy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#e8eaf2]">คัดลอกข้อมูลดิบด่วน (Clipboard)</div>
                  <div className="text-[11px] text-white/40 mt-1 leading-relaxed">
                    ก๊อปปี้รหัสรูปแบบ CSV เพื่อไปวางเพื่อใช้งานอย่างรวดเร็ว
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional setting fields based on selection */}
          {selectedType === 'email' && (
            <div className="bg-[#0A0A0B] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                รายละเอียดการจัดส่งทางอีเมล
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-white/50 font-bold uppercase tracking-wide">อีเมลผู้รับ</label>
                <div className="inline-flex max-w-max items-center gap-1.5 px-3 py-1 bg-[#C4A661]/10 border border-[#C4A661]/20 rounded-full text-xs font-mono text-[#C4A661]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{targetEmail}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-white/50 font-bold uppercase tracking-wide">หัวข้อเรื่อง</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg p-2.5 text-xs text-[#e8eaf2] outline-none focus:border-[#C4A661] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-white/50 font-bold uppercase tracking-wide">เพิ่มความคิดเห็นกำกับ (เพิ่มเติม)</label>
                <input
                  type="text"
                  value={emailNote}
                  onChange={(e) => setEmailNote(e.target.value)}
                  placeholder="เช่น รายงานผลคลาดเคลื่อนการใช้เชื้อเพลิง ม.ค. - พ.ค."
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg p-2.5 text-xs text-[#e8eaf2] outline-none focus:border-[#C4A661] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Top 5 rows preview */}
          {selectedType !== 'sheeturl' && (
            <div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                ตัวอย่าง 5 บรรทัดแรกในฐานข้อมูลส่งออก
              </div>
              <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0A0A0B]">
                <div className="overflow-x-auto max-h-40">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0A0A0B] border-b border-white/10 text-[9px] font-bold text-white/40 uppercase tracking-wider">
                        <th className="p-2">เดือน</th>
                        <th className="p-2 text-right">PL:A</th>
                        <th className="p-2 text-right">PL:B</th>
                        <th className="p-2 text-right">Loss:A</th>
                        <th className="p-2 text-right">Loss:B</th>
                        <th className="p-2 text-right text-[#C4A661]">PD:A</th>
                        <th className="p-2 text-right text-[#D4B671]">PD:B</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[10.5px]">
                      {data.slice(0, 5).map((r, i) => {
                        const lossA = r.dl_a + r.bm_a + r.stl_a + r.oth_a;
                        const lossB = r.dl_b + r.bm_b + r.stl_b + r.oth_b;
                        return (
                          <tr key={i} className="text-white/40 hover:bg-white/5">
                            <td className="p-2 font-bold font-mono text-[#e8eaf2]">{MONTHS_TH[r.month] || r.month}</td>
                            <td className="p-2 text-right font-mono">{r.pl_a}</td>
                            <td className="p-2 text-right font-mono">{r.pl_b}</td>
                            <td className="p-2 text-right font-mono">{lossA}</td>
                            <td className="p-2 text-right font-mono">{lossB}</td>
                            <td className="p-2 text-right font-mono text-[#C4A661]">{r.pd_a.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono text-[#D4B671]">{r.pd_b.toLocaleString()}</td>
                          </tr>
                        )
                      })}
                      {data.length > 5 && (
                        <tr className="bg-[#0A0A0B]">
                          <td colSpan={7} className="p-2 text-center text-white/20 italic text-[10px]">
                            ... และแถวข้อมูลที่เหลือทั้งหมดอีก {data.length - 5} เดือน
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action controls footer */}
        <div className="p-4 border-t border-white/10 bg-[#0A0A0B] flex gap-3 justify-end items-center">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white/50 hover:text-[#e8eaf2] bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleExportExecute}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-black bg-[#C4A661] hover:bg-[#D4B671] transition-all hover:scale-102 active:scale-95 inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-[#C4A661]/10"
          >
            {selectedType === 'email' && <Mail className="w-3.5 h-3.5" />}
            {selectedType === 'csv' && <FileText className="w-3.5 h-3.5" />}
            {selectedType === 'sheeturl' && <ExternalLink className="w-3.5 h-3.5" />}
            {selectedType === 'copy' && <Copy className="w-3.5 h-3.5" />}
            <span>
              {selectedType === 'email' && 'พิมพ์รายงานส่งออกด้วย Gmail'}
              {selectedType === 'csv' && 'บันทึกเป็นไฟล์ CSV'}
              {selectedType === 'sheeturl' && 'เปิดหน้าแผนงานใน Google Sheets'}
              {selectedType === 'copy' && 'ก๊อปปี้ดิบ CSV'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
