import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  ChevronDown, 
  Info,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Check
} from 'lucide-react';

import {
  ProductionRow,
  DepartmentFilter,
  DisplayMode,
  ViewTab,
  ConnectionState,
  DEMO_DATA,
  MONTHS_TH
} from './types';
import { extractSpreadsheetId } from './utils/sheetHelpers';

import Sidebar from './components/Sidebar';
import KPIGrid from './components/KPIGrid';
import OEEOverview from './components/OEEOverview';
import DashboardCharts from './components/DashboardCharts';
import DataTable from './components/DataTable';
import ExportModal from './components/ExportModal';

export default function App() {
  // Application Data & Configuration States
  const [allData, setAllData] = useState<ProductionRow[]>(DEMO_DATA);
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set(DEMO_DATA.map(d => d.month)));
  const [selectedDept, setSelectedDept] = useState<DepartmentFilter>('all');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('chart');
  const [viewTab, setViewTab] = useState<ViewTab>('overview');

  // Google Sheets Connector States
  // Seed the input with the env-var ID so users see it pre-filled.
  const envSheetId = extractSpreadsheetId(import.meta.env.VITE_SHEET_ID ?? '');
  const [sheetIdInput, setSheetIdInput] = useState(envSheetId);
  const [sheetNameInput, setSheetNameInput] = useState('Sheet1');
  const [activeSheetId, setActiveSheetId] = useState('');
  const [activeSheetName, setActiveSheetName] = useState('Sheet1');
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>('demo');

  // Modal / Toast Notification States
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'ok' | 'err'>('ok');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Trigger Slide-in Toast notifications
  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToastMsg(msg);
    setToastType(type);
    setIsToastVisible(true);
  };

  useEffect(() => {
    if (isToastVisible) {
      const timer = setTimeout(() => {
        setIsToastVisible(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isToastVisible]);

  // Auto-connect on first render when VITE_SHEET_ID is set.
  useEffect(() => {
    if (envSheetId) {
      connectGoogleSheet(envSheetId, 'Sheet1');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Loading Simulation or Google Sheets parsing
  const loadDemoData = () => {
    setAllData(DEMO_DATA);
    setSelectedMonths(new Set(DEMO_DATA.map(d => d.month)));
    setConnection('demo');
    setIsConnectOpen(false);
    showToast('โหลดข้อมูลสถิติตัวอย่างแล้ว', 'ok');
  };

  // Parsing CSV pulled from Google Sheets
  const parseCSVData = (csvText: string): ProductionRow[] => {
    // Custom CSV parser that handles double quotes with commas correctly
    // and preserves empty cells (uncompressed index sequence)
    const parseCSVLine = (text: string): string[] => {
      const result: string[] = [];
      let cell = '';
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cell.trim());
          cell = '';
        } else {
          cell += char;
        }
      }
      result.push(cell.trim());
      return result;
    };

    const lines = csvText.split(/\r?\n/).map(line => parseCSVLine(line));

    // Helper map to convert different Thai/English month strings into standard months
    const normalizeMonth = (val: string): string | null => {
      const m = val.toUpperCase().trim().replace(/\./g, '');
      if (!m) return null;

      // English names
      if (['JAN', 'JANUARY'].includes(m)) return 'JAN';
      if (['FEB', 'FEBRUARY'].includes(m)) return 'FEB';
      if (['MAR', 'MARCH'].includes(m)) return 'MAR';
      if (['APR', 'APRIL'].includes(m)) return 'APR';
      if (['MAY'].includes(m)) return 'MAY';
      if (['JUN', 'JUNE'].includes(m)) return 'JUN';
      if (['JUL', 'JULY'].includes(m)) return 'JUL';
      if (['AUG', 'AUGUST'].includes(m)) return 'AUG';
      if (['SEP', 'SEPTEMBER', 'SEPT'].includes(m)) return 'SEP';
      if (['OCT', 'OCTOBER'].includes(m)) return 'OCT';
      if (['NOV', 'NOVEMBER'].includes(m)) return 'NOV';
      if (['DEC', 'DECEMBER'].includes(m)) return 'DEC';

      // Thai names
      if (['มค', 'มกรา', 'มกราคม'].includes(m)) return 'JAN';
      if (['กพ', 'กุมภา', 'กุมภาพันธ์'].includes(m)) return 'FEB';
      if (['มีค', 'มีนา', 'มีนาคม'].includes(m)) return 'MAR';
      if (['เมย', 'เมษา', 'เมษายน'].includes(m)) return 'APR';
      if (['พค', 'พฤษภา', 'พฤษภาคม'].includes(m)) return 'MAY';
      if (['มิย', 'มิถุนา', 'มิถุนายน'].includes(m)) return 'JUN';
      if (['กค', 'กรกฎา', 'กรกฎาคม'].includes(m)) return 'JUL';
      if (['สค', 'สิงหา', 'สิงหาคม'].includes(m)) return 'AUG';
      if (['กย', 'กันยา', 'กันยายน'].includes(m)) return 'SEP';
      if (['ตค', 'ตุลา', 'ตุลาคม'].includes(m)) return 'OCT';
      if (['พย', 'พฤศจิกา', 'พฤศจิกายน'].includes(m)) return 'NOV';
      if (['ธค', 'ธันวา', 'ธันวาคม'].includes(m)) return 'DEC';

      // Check if it represents a pure integer month number (e.g. 1 or "01")
      const num = parseInt(m, 10);
      if (!isNaN(num) && num >= 1 && num <= 12 && m.length <= 2) {
        const order = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return order[num - 1];
      }

      // Check if it's a date string (e.g., "2025-05-12" or "12/05/2025" or "12-05-2025")
      const parts = m.split(/[\/\-\.\s]+/);
      if (parts.length >= 2) {
        // Try parsing using built-in engine first
        const parsedDate = new Date(val);
        if (!isNaN(parsedDate.getTime())) {
          return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][parsedDate.getMonth()];
        }

        // Manual backup split matching for items like "12/5/2025" or "2025-05-12"
        for (const p of parts) {
          const pNum = parseInt(p, 10);
          if (!isNaN(pNum) && pNum >= 1 && pNum <= 12 && p.length <= 2) {
            if (parts[0].length === 4) {
              const mIdx = parseInt(parts[1], 10);
              if (mIdx >= 1 && mIdx <= 12) return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][mIdx - 1];
            }
            if (parts[2] && (parts[2].length === 4 || parts[2].length === 2)) {
              const mIdx = parseInt(parts[1], 10);
              if (mIdx >= 1 && mIdx <= 12) return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][mIdx - 1];
            }
          }
        }
      }

      return null;
    };

    // Find the primary index position for headers with various Thai/English fallback names
    let headerRowIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].some(cell => {
        const c = cell.replace(/^"|"$/g, '').trim().toUpperCase();
        return ['MONTH', 'เดือน', 'MONTHS', 'ช่วงเวลา', 'PERIOD', 'TIMELINE', 'DATE', 'วันที่', 'มิติ'].includes(c);
      })) {
        headerRowIdx = i;
        break;
      }
    }

    // Fallback search: Let's find a row whose subsequent row has a first cell that is a valid month!
    if (headerRowIdx === -1) {
      for (let i = 0; i < lines.length; i++) {
        const row = lines[i];
        if (!row || row.length === 0) continue;
        let foundValidMonthChild = false;
        for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
          const nextRow = lines[j];
          if (nextRow && nextRow.length > 0 && nextRow[0]) {
            const rawVal = nextRow[0].replace(/^"|"$/g, '').trim();
            if (normalizeMonth(rawVal)) {
              foundValidMonthChild = true;
              break;
            }
          }
        }
        if (foundValidMonthChild) {
          headerRowIdx = i;
          break;
        }
      }
    }

    // Fallback: Default to row 0 if still not located
    if (headerRowIdx === -1) {
      headerRowIdx = 0;
    }

    // Clean headers for indexing, remove all spaces, punctuations, and uppercase them
    const normalizeHeader = (h: string): string => {
      return h.toUpperCase()
        .replace(/^"|"$/g, '')
        .trim()
        .replace(/[\s_#-]+/g, '')
        .replace(/:/g, '');
    };

    const headers = lines[headerRowIdx].map(h => normalizeHeader(h));

    const parsed: ProductionRow[] = [];

    // Fallback key mappings to look up
    const keyMapFallback: Record<keyof ProductionRow, string[]> = {
      month: ['MONTH', 'เดือน'],
      pl_a: ['PLA', 'PL แผนก A', 'แผนการเดินเครื่อง A', 'แผน A', 'PL A', 'PLAN:A', 'PL:A'],
      dl_a: ['DLA', 'รอวัตถุดิบ A', 'DL A', 'DELAY A', 'DL:A'],
      bm_a: ['BMA', 'ซ่อมบำรุง A', 'BM A', 'MAINTENANCE A', 'BM:A'],
      stl_a: ['STLA', 'เริ่มเดินเครื่อง A', 'STL A', 'STARTUP A', 'STL:A'],
      oth_a: ['OTHA', 'อื่นๆ A', 'OTH A', 'OTHER A', 'OTH:A'],
      pl_b: ['PLB', 'PL แผนก B', 'แผนการเดินเครื่อง B', 'แผน B', 'PL B', 'PLAN:B', 'PL:B'],
      dl_b: ['DLB', 'รอวัตถุดิบ B', 'DL B', 'DELAY B', 'DL:B'],
      bm_b: ['BMB', 'ซ่อมบำรุง B', 'BM B', 'MAINTENANCE B', 'BM:B'],
      stl_b: ['STLB', 'เริ่มเดินเครื่อง B', 'STL B', 'STARTUP B', 'STL:B'],
      oth_b: ['OTHB', 'อื่นๆ B', 'OTH B', 'OTHER B', 'OTH:B'],
      oee1: ['OEE1', 'OEEเตา1', 'OEEเตาที่1', 'OEE#1'],
      oee2: ['OEE2', 'OEEเตา2', 'OEEเตาที่2', 'OEE#2'],
      oee3: ['OEE3', 'OEEเตา3', 'OEEเตาที่3', 'OEE#3'],
      oee4: ['OEE4', 'OEEเตา4', 'OEEเตาที่4', 'OEE#4'],
      pd_a: ['PDA', 'ผลผลิต A', 'จำนวนผลิต A', 'PD A', 'PRODUCTION A', 'PD:A'],
      pd_b: ['PDB', 'ผลผลิต B', 'จำนวนผลิต B', 'PD B', 'PRODUCTION B', 'PD:B'],
      rm_a: ['RMA', 'วัตถุดิบ A', 'น้ำหนักวัตถุดิบ A', 'RM A', 'MATERIAL A', 'RM:A'],
      rm_b: ['RMB', 'วัตถุดิบ B', 'น้ำหนักวัตถุดิบ B', 'RM B', 'MATERIAL B', 'RM:B'],
    };

    for (let i = headerRowIdx + 1; i < lines.length; i++) {
      const row = lines[i];
      if (!row || row.length === 0 || !row[0]) continue;

      // Parse the month column
      const rawMonth = row[0].replace(/^"|"$/g, '').trim();
      const normMonth = normalizeMonth(rawMonth);
      if (!normMonth) continue; // Keep only identified valid standard month rows

      const getValue = (keys: string[]): number => {
        // Prepare normalized lookups to match headers cleaned with normalizeHeader()
        const normalizedKeys = keys.map(k => normalizeHeader(k));
        for (const nk of normalizedKeys) {
          const idx = headers.indexOf(nk);
          if (idx !== -1 && row[idx]) {
            const rawVal = row[idx].replace(/^"|"$/g, '').trim();
            // Clean commas, percentages and spaces from the value so parseFloat is 100% accurate
            const cleanedVal = rawVal.replace(/,/g, '').replace(/%/g, '').trim();
            const numeric = parseFloat(cleanedVal);
            return isNaN(numeric) ? 0 : numeric;
          }
        }
        return 0;
      };

      parsed.push({
        month: normMonth,
        pl_a: getValue(keyMapFallback.pl_a),
        dl_a: getValue(keyMapFallback.dl_a),
        bm_a: getValue(keyMapFallback.bm_a),
        stl_a: getValue(keyMapFallback.stl_a),
        oth_a: getValue(keyMapFallback.oth_a),
        pl_b: getValue(keyMapFallback.pl_b),
        dl_b: getValue(keyMapFallback.dl_b),
        bm_b: getValue(keyMapFallback.bm_b),
        stl_b: getValue(keyMapFallback.stl_b),
        oth_b: getValue(keyMapFallback.oth_b),
        oee1: getValue(keyMapFallback.oee1),
        oee2: getValue(keyMapFallback.oee2),
        oee3: getValue(keyMapFallback.oee3),
        oee4: getValue(keyMapFallback.oee4),
        pd_a: getValue(keyMapFallback.pd_a),
        pd_b: getValue(keyMapFallback.pd_b),
        rm_a: getValue(keyMapFallback.rm_a),
        rm_b: getValue(keyMapFallback.rm_b),
      });
    }

    return parsed;
  };

  const connectGoogleSheet = async (rawId: string, name: string) => {
    const id = extractSpreadsheetId(rawId);

    if (!id) {
      showToast('กรุณากรอกคีย์ Sheet ID ของท่าน', 'err');
      return;
    }

    setConnection('loading');
    const sheetURL = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
    
    try {
      const response = await fetch(sheetURL);
      if (!response.ok) {
        throw new Error(`การเรียกดูข้อมูลขัดข้อง (รหัสสถานะ: ${response.status})`);
      }
      
      const csvContent = await response.text();
      const rows = parseCSVData(csvContent);
      
      if (rows.length === 0) {
        throw new Error('ไม่พบข้อมูลรายเดือนในแผ่นงานที่ระบุ หรือไม่มีแถวคอลัมน์ข้อมูลที่ตรงกัน');
      }

      setAllData(rows);
      setSelectedMonths(new Set(rows.map(r => r.month)));
      setActiveSheetId(id);
      setActiveSheetName(name);
      setConnection('connected');
      setIsConnectOpen(false);
      showToast(`เชื่อมต่อชีตสำเร็จแล้ว ดึงข้อมูลได้ ${rows.length} แถว`, 'ok');
    } catch (err: any) {
      setConnection('error');
      showToast(err.message || 'โครงสร้างสเปรดชีตไม่ถูกต้อง (โปรดปลดล็อคการเข้าถึงเป็นสาธารณะ)', 'err');
      console.error(err);
    }
  };

  const handleSyncTrigger = async () => {
    if (activeSheetId) {
      await connectGoogleSheet(activeSheetId, activeSheetName);
    } else {
      // Re-trigger simulator reload
      setConnection('loading');
      setTimeout(() => {
        setAllData(DEMO_DATA);
        setSelectedMonths(new Set(DEMO_DATA.map(d => d.month)));
        setConnection('demo');
        showToast('อัปเดตสถิติตัวอย่างสำเร็จ', 'ok');
      }, 700);
    }
  };

  const toggleMonth = (monthKey: string) => {
    const updated = new Set(selectedMonths);
    if (updated.has(monthKey)) {
      updated.delete(monthKey);
    } else {
      updated.add(monthKey);
    }
    setSelectedMonths(updated);
  };

  const toggleAllMonths = () => {
    if (selectedMonths.size === allData.length) {
      setSelectedMonths(new Set());
    } else {
      setSelectedMonths(new Set(allData.map(d => d.month)));
    }
  };

  // Perform filtration across active months
  const filteredData = allData.filter(d => selectedMonths.has(d.month));

   return (
    <div className="flex min-h-screen bg-[#080809] text-[#e8eaf2] font-sans antialiased">
      {/* 1. SIDEBAR Controls */}
      <Sidebar 
        currentView={viewTab}
        onViewChange={(tab) => setViewTab(tab)}
        onToggleConnect={() => setIsConnectOpen(!isConnectOpen)}
        onLoadDemo={loadDemoData}
        onOpenExport={() => {
          if (filteredData.length === 0) {
            showToast('ไม่มีข้อมูลสำหรับส่งออก กรุณาเลือกเดือนก่อน', 'err');
          } else {
            setIsExportOpen(true);
          }
        }}
        onSync={handleSyncTrigger}
        connection={connection}
      />

      {/* 2. MAIN layout container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0D0D0F]">
        
        {/* Topbar Header */}
        <header className="h-[64px] bg-[#0A0A0B] border-b border-white/10 px-6 flex items-center justify-between gap-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold font-serif text-white/90 tracking-wide">
              {viewTab === 'overview' && 'ภาพรวมการผลิตหลัก'}
              {viewTab === 'loss' && 'วิเคราะห์ช่วงเวลาหยุดชะงัก (Loss)'}
              {viewTab === 'production' && 'ข้อมูลฝ่ายผลิตและประสิทธิภาพโดยรวมของเครื่องจักร'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Google sheets connector indicators */}
            <div 
              onClick={() => setIsConnectOpen(!isConnectOpen)}
              className="px-3 py-1.5 rounded-full bg-[#0A0A0B] hover:bg-[#111115] border border-white/10 hover:border-white/20 cursor-pointer flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
            >
              <div 
                className={`w-2 h-2 rounded-full shrink-0 ${
                  connection === 'connected' 
                    ? 'bg-[#C4A661] shadow-[0_0_8px_#C4A661]' 
                    : connection === 'loading'
                    ? 'bg-[#8E793E] animate-pulse'
                    : connection === 'error'
                    ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                    : 'bg-white/20'
                }`} 
              />
              <span className="font-medium text-[11px] tracking-wide">
                {connection === 'connected' && 'เชื่อมต่อชีตแล้ว'}
                {connection === 'loading' && 'กำลังโหลดชีต...'}
                {connection === 'error' && 'เกิดข้อผิดพลาด'}
                {connection === 'demo' && 'ข้อมูลโมเดลจำลอง'}
              </span>
            </div>

            <button 
              onClick={() => {
                if (filteredData.length === 0) {
                  showToast('ไม่มีข้อมูลสำหรับส่งออก', 'err');
                } else {
                  setIsExportOpen(true);
                }
              }}
              className="px-3.5 py-1.5 rounded-md bg-[#0A0A0B] hover:bg-[#111] text-white/60 hover:text-white border border-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>ส่งออก</span>
            </button>

            <button 
              onClick={handleSyncTrigger}
              disabled={connection === 'loading'}
              className="px-3.5 py-1.5 rounded-md bg-[#C4A661]/10 border border-[#C4A661]/20 hover:bg-[#C4A661]/20 text-[#C4A661] text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${connection === 'loading' ? 'animate-spin' : ''}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>
        </header>

        {/* Core content wrapper */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* A. GOOGLE SHEETS Connection Portal form panel */}
          {isConnectOpen && (
            <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl p-5 mb-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 font-bold text-sm text-[#C4A661] font-serif">
                <Database className="w-4 h-4 text-[#C4A661]" />
                <span>กำหนดช่องทางลิ้งค์คีย์ Google Sheets</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
                    สเปรดชีต ID (ดูจาก URL ลิ้่งค์สเปรดชีต)
                  </label>
                  <input 
                    type="text"
                    value={sheetIdInput}
                    onChange={(e) => setSheetIdInput(e.target.value)}
                    placeholder="เช่น 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74..."
                    className="w-full bg-[#050506] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-[#e8eaf2] outline-none focus:border-[#C4A661] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
                    ชื่อแท็บหน้าแผ่นงาน (Sheet Tab Name)
                  </label>
                  <input 
                    type="text"
                    value={sheetNameInput}
                    onChange={(e) => setSheetNameInput(e.target.value)}
                    placeholder="Sheet1"
                    className="w-full bg-[#050506] border border-white/10 rounded-lg px-3 py-2 text-xs font-sans text-[#e8eaf2] outline-none focus:border-[#C4A661] transition-colors"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => connectGoogleSheet(sheetIdInput, sheetNameInput)}
                    className="flex-1 bg-[#C4A661] hover:bg-[#D4B671] text-black font-semibold text-xs py-2 px-4 rounded-lg transition-transform hover:scale-101 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#C4A661]/10"
                  >
                    <span>เชื่อมต่อใช้งาน</span>
                  </button>
                  <button 
                    onClick={() => setIsConnectOpen(false)}
                    className="bg-transparent hover:bg-white/5 border border-white/10 text-white/50 hover:text-white font-semibold text-xs p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    ปิด
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-white/40 leading-relaxed bg-[#050506] p-3 rounded-lg border border-white/10 font-sans">
                💡 <span className="font-bold text-[#C4A661]">วิธีกรอลิ้งค์ชีต:</span> เปิดไฟล์ Google Sheet ของคุณ ➔ คลิกแชร์ (Share) เปลี่ยนสิทธิ์ให้ <span className="text-[#C4A661]">"ทุกคนที่มีลิงก์มีสิทธิ์อ่าน"</span> ➔ คัดลอกรหัสอักขระในช่วงกลาง URL ของเบราว์เซอร์ไปวางตรวจสอบช่องบันทึก
                <div className="font-mono text-[9.5px] text-white/20 mt-1.5">
                   docs.google.com/spreadsheets/d/<span className="text-[#C4A661] font-bold">1BxiMVs0XRA...</span>/edit
                </div>
              </div>
            </div>
          )}

          {/* B. FILTER TOOLBAR Bar (Month choices & Dept classification) */}
          <div className="bg-[#0A0A0B] border border-white/10 rounded-xl p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">เดือน:</span>
              <div className="flex flex-wrap gap-1.5">
                <button 
                  onClick={toggleAllMonths}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                    selectedMonths.size === allData.length
                      ? 'bg-[#C4A661]/10 text-[#C4A661] border-[#C4A661]/40'
                      : 'bg-transparent text-white/40 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  ทั้งหมด
                </button>
                {allData.map(d => (
                  <button
                    key={d.month}
                    onClick={() => toggleMonth(d.month)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                      selectedMonths.has(d.month)
                        ? 'bg-[#C4A661]/10 text-[#C4A661] border-[#C4A661]/40'
                        : 'bg-transparent text-white/40 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {MONTHS_TH[d.month] || d.month}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:block w-[1px] h-6 bg-white/10" />

            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">ฝ่ายแยกประเภท:</span>
              <div className="bg-[#050506] border border-white/10 p-0.5 rounded-lg inline-flex">
                <button 
                  onClick={() => setSelectedDept('all')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedDept === 'all' 
                      ? 'bg-[#C4A661]/10 text-[#C4A661] border border-[#C4A661]/20' 
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  ทั้งหมดที่รัน
                </button>
                <button 
                  onClick={() => setSelectedDept('A')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedDept === 'A' 
                      ? 'bg-[#C4A661]/10 text-[#C4A661] border border-[#C4A661]/20' 
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  แผนก A
                </button>
                <button 
                  onClick={() => setSelectedDept('B')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedDept === 'B' 
                      ? 'bg-[#C4A661]/10 text-[#C4A661] border border-[#C4A661]/20' 
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  แผนก B
                </button>
              </div>
            </div>

            {/* View Mode (Charts vs Raw Data table) */}
            <div className="ml-auto flex items-center gap-1 bg-[#050506] border border-white/10 p-0.5 rounded-lg">
              <button 
                onClick={() => setDisplayMode('chart')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  displayMode === 'chart' 
                    ? 'bg-[#C4A661]/10 text-[#C4A661] border border-[#C4A661]/20' 
                    : 'text-white/40 hover:text-white'
                }`}
                title="วิจารณ์ผังกราฟ"
              >
                กราฟสถิติ
              </button>
              <button 
                onClick={() => setDisplayMode('table')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  displayMode === 'table' 
                    ? 'bg-[#C4A661]/10 text-[#C4A661] border border-[#C4A661]/20' 
                    : 'text-white/40 hover:text-white'
                }`}
                title="ดูตารางเต็ม"
              >
                ตารางข้อมูล
              </button>
            </div>
          </div>

          {/* C. MULTIPLE DYNAMIC VIEWS Renderer area */}
          {filteredData.length > 0 ? (
            <div className="flex flex-col gap-6 animate-in fade-in-30 duration-200">
              
              {/* Renders KPIs first in all views */}
              <KPIGrid data={filteredData} dept={selectedDept} />

              {/* Renders dashboard body indicators */}
              {displayMode === 'chart' ? (
                <>
                  {/* Row content varies based on View Tab */}
                  {viewTab === 'overview' && (
                    <>
                      <OEEOverview data={filteredData} />
                      <DashboardCharts data={filteredData} dept={selectedDept} tab={viewTab} />
                    </>
                  )}
                  {viewTab === 'loss' && (
                    <>
                      <DashboardCharts data={filteredData} dept={selectedDept} tab={viewTab} />
                    </>
                  )}
                  {viewTab === 'production' && (
                    <>
                      <DashboardCharts data={filteredData} dept={selectedDept} tab={viewTab} />
                      <div className="bg-[#0A0A0B] border border-white/10 p-4 rounded-xl flex items-center gap-3.5 text-xs text-white/40 max-w-xl">
                        <Info className="w-4 h-4 text-[#C4A661] shrink-0" />
                        <span>ฝ่ายผลิตเครื่องจักรและจัดเตรียม (A+B) ครอบคลุมปริมาณป้อนเตาอบ หมุน ม้วน และสลิตเตอร์ตัดแบ่งกระบวนการ</span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <DataTable data={filteredData} />
              )}
            </div>
          ) : (
            <div className="bg-[#0A0A0B] border border-white/10 p-16 rounded-2xl text-center flex flex-col items-center justify-center gap-4">
              <AlertCircle className="w-8 h-8 text-[#C4A661]" />
              <div className="text-sm font-bold text-white/90 font-serif">โปรดเลือกเดือนใดเดือนหนึ่งเป็นอย่างน้อย</div>
              <p className="text-xs text-white/40 max-w-sm leading-relaxed">
                ขณะนี้ไม่มีเดือนใดได้รับเลือกในแถบฟิลเตอร์เครื่องปรับปรุง โปรดเปิดการใช้งานเดือนอย่างน้อยหนึ่งรายการเพื่อแสดง KPI และกราฟสถิติสังเขป
              </p>
              <button 
                onClick={toggleAllMonths}
                className="mt-2 text-xs font-semibold px-4 py-2 bg-[#C4A661] hover:bg-[#D4B671] text-black rounded-lg transition-transform active:scale-95 cursor-pointer shadow-lg shadow-[#C4A661]/10"
              >
                ทำเครื่องหมายเลือกทุกเดือน
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 3. MODALS Floating Layers */}
      <ExportModal 
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={filteredData}
        sheetId={activeSheetId || undefined}
        onShowToast={showToast}
      />

      {/* 4. NOTIFICATION floating slide-in toasts alerts */}
      <div 
        className={`fixed bottom-6 right-6 z-50 bg-[#0A0A0B] border border-white/10 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs text-[#e8eaf2] transition-all duration-300 pointer-events-none transform ${
          isToastVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className={`p-1 rounded-md ${toastType === 'ok' ? 'bg-[#C4A661]/10 text-[#C4A661]' : 'bg-rose-500/10 text-rose-400'}`}>
          {toastType === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
        </div>
        <span>{toastMsg}</span>
      </div>
    </div>
  );
}
