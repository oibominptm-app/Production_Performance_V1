/**
 * Types & Interfaces for PTM Agriculture Production Dashboard.
 */

export interface ProductionRow {
  month: string;       // e.g. 'JAN', 'FEB', 'MAR'
  pl_a: number;        // Plant Plan A (hours)
  dl_a: number;        // Delay/Waiting for material A (hours)
  bm_a: number;        // Maintenance/Breakdown A (hours)
  stl_a: number;       // Startup Loss A (hours)
  oth_a: number;       // Other losses A (hours)
  pl_b: number;        // Plant Plan B (hours)
  dl_b: number;        // Delay/Waiting for material B (hours)
  bm_b: number;        // Maintenance/Breakdown B (hours)
  stl_b: number;       // Startup Loss B (hours)
  oth_b: number;       // Other losses B (hours)
  oee1: number;        // OEE Oven 1 (%)
  oee2: number;        // OEE Oven 2 (%)
  oee3: number;        // OEE Oven 3 (%)
  oee4: number;        // OEE Oven 4 (%)
  pd_a: number;        // Production Quantity A (pieces)
  pd_b: number;        // Production Quantity B (pieces)
  rm_a: number;        // Raw Material used A (kg)
  rm_b: number;        // Raw Material used B (kg)
}

export type DepartmentFilter = 'all' | 'A' | 'B';
export type DisplayMode = 'chart' | 'table';
export type ViewTab = 'overview' | 'loss' | 'production';
export type ExportType = 'email' | 'csv' | 'sheeturl' | 'copy';
export type ConnectionState = 'demo' | 'connected' | 'loading' | 'error';

export const MONTHS_TH: Record<string, string> = {
  JAN: 'ม.ค.',
  FEB: 'ก.พ.',
  MAR: 'มี.ค.',
  APR: 'เม.ย.',
  MAY: 'พ.ค.',
  JUN: 'มิ.ย.',
  JUL: 'ก.ค.',
  AUG: 'ส.ค.',
  SEP: 'ก.ย.',
  OCT: 'ต.ค.',
  NOV: 'พ.ย.',
  DEC: 'ธ.ค.'
};

export const MONTHS_EN: Record<string, string> = {
  JAN: 'January',
  FEB: 'February',
  MAR: 'March',
  APR: 'April',
  MAY: 'May',
  JUN: 'June',
  JUL: 'July',
  AUG: 'August',
  SEP: 'September',
  OCT: 'October',
  NOV: 'November',
  DEC: 'December'
};

export const DEMO_DATA: ProductionRow[] = [
  {
    month: 'JAN',
    pl_a: 783, dl_a: 51, bm_a: 2, stl_a: 15, oth_a: 21,
    pl_b: 693, dl_b: 39, bm_b: 6, stl_b: 21, oth_b: 3,
    oee1: 81.79, oee2: 82.16, oee3: 0, oee4: 81.79,
    pd_a: 328600, pd_b: 322090,
    rm_a: 1854510, rm_b: 1966920
  },
  {
    month: 'FEB',
    pl_a: 528, dl_a: 36, bm_a: 3, stl_a: 15, oth_a: 0,
    pl_b: 528, dl_b: 69, bm_b: 5, stl_b: 21, oth_b: 6,
    oee1: 76.53, oee2: 74.07, oee3: 0, oee4: 76.53,
    pd_a: 244370, pd_b: 234480,
    rm_a: 1399170, rm_b: 1464930
  },
  {
    month: 'MAR',
    pl_a: 552, dl_a: 61, bm_a: 31, stl_a: 42, oth_a: 0,
    pl_b: 594, dl_b: 96, bm_b: 14, stl_b: 39, oth_b: 0,
    oee1: 67.23, oee2: 55.34, oee3: 0, oee4: 63.83,
    pd_a: 229320, pd_b: 246540,
    rm_a: 1496940, rm_b: 1522400
  },
  {
    month: 'APR',
    pl_a: 627, dl_a: 54, bm_a: 8, stl_a: 47, oth_a: 72,
    pl_b: 627, dl_b: 93, bm_b: 5, stl_b: 24, oth_b: 50,
    oee1: 55.79, oee2: 54.22, oee3: 0, oee4: 57.08,
    pd_a: 228070, pd_b: 209350,
    rm_a: 1416710, rm_b: 1386610
  },
  {
    month: 'MAY',
    pl_a: 505, dl_a: 39, bm_a: 11, stl_a: 34, oth_a: 0,
    pl_b: 546, dl_b: 63, bm_b: 1, stl_b: 30, oth_b: 0,
    oee1: 76.70, oee2: 65.74, oee3: 2.42, oee4: 76.33,
    pd_a: 235410, pd_b: 234520,
    rm_a: 1525030, rm_b: 1429510
  }
];
