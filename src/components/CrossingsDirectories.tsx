import React, { useState, useMemo } from 'react';
import { DATA } from '../data/crossings';
import { Crossing } from '../types';
import { 
  Search, ShieldAlert, CheckCircle2, AlertTriangle, 
  Download, FileSpreadsheet, MapIcon, Layers3, Activity, ArrowUpRight
} from 'lucide-react';

interface CrossingsDirectoriesProps {
  onSelectCrossing: (crossing: Crossing | null) => void;
  selectedCrossing: Crossing | null;
}

export const CrossingsDirectories: React.FC<CrossingsDirectoriesProps> = ({
  onSelectCrossing,
  selectedCrossing
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const crossings = useMemo(() => {
    return (DATA.crossings || []) as Crossing[];
  }, []);

  // Filter distinct countries
  const countries = useMemo(() => {
    const list = new Set<string>();
    crossings.forEach(c => {
      if (c.country) list.add(c.country);
    });
    return Array.from(list).sort();
  }, [crossings]);

  // Handle advanced multiple filters
  const filteredCrossings = useMemo(() => {
    return crossings.filter(cx => {
      const matchesSearch = 
        cx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cx.name_en && cx.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cx.highway && cx.highway.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCountry = selectedCountry === 'all' || cx.country === selectedCountry;
      const matchesLayer = selectedLayer === 'all' || cx.layer === selectedLayer;
      const matchesStatus = selectedStatus === 'all' || cx.status === selectedStatus;

      return matchesSearch && matchesCountry && matchesLayer && matchesStatus;
    });
  }, [crossings, searchQuery, selectedCountry, selectedLayer, selectedStatus]);

  // Download filtered data as JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(filteredCrossings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'iran-border-crossings-saf.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div id="crossings-directory-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full text-right p-1">
      
      {/* Search Grid panel: span 2 */}
      <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl flex flex-col overflow-hidden h-full">
        {/* Panel Head */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-800/60 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers3 className="h-4.5 w-4.5 text-teal-400" />
              <span>پایانه مرزي تجاری جمهوری اسلامی ایران</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono font-semibold-mt-0.5">IRICA OFFICIAL CUSTOM PORTS DATABASE</p>
          </div>
          
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-teal-400" />
            <span>خروجی فرمت JSON</span>
          </button>
        </div>

        {/* Filters Grid bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="جستجوی نام گمرک یا جاده..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 pr-9 pl-3 py-2 text-xs text-slate-300 rounded-xl focus:outline-none focus:border-teal-500 font-sans"
            />
          </div>

          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300 rounded-xl focus:outline-none focus:border-teal-500 font-sans cursor-pointer"
            >
              <option value="all">همه کشورهای همسایه</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300 rounded-xl focus:outline-none focus:border-teal-500 font-sans cursor-pointer"
            >
              <option value="all">همه انواع مسیرها</option>
              <option value="road">جاده‌ای (Road Only)</option>
              <option value="combined">ترکیبی (Combined)</option>
              <option value="rail">صرفاً ریلی (Rail Core)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300 rounded-xl focus:outline-none focus:border-teal-500 font-sans cursor-pointer"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="فعال">پایانه‌های فعال</option>
              <option value="نیمه فعال">پایانه‌های نیمه فعال</option>
              <option value="مسدود">پایانه‌های مسدود</option>
            </select>
          </div>
        </div>

        {/* High performance table container */}
        <div className="flex-grow overflow-auto border border-slate-800/60 rounded-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/85 sticky top-0 text-slate-400 border-b border-slate-800/80 font-medium">
              <tr>
                <th className="p-3">نام پایانه (گمرک)</th>
                <th className="p-3">کشور متصل</th>
                <th className="p-3">نوع پایانه</th>
                <th className="p-3">شاهراه متصل</th>
                <th className="p-3">تاخیر گمرکی</th>
                <th className="p-3 text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 bg-slate-900/5 select-none">
              {filteredCrossings.length > 0 ? (
                filteredCrossings.map((cx) => (
                  <tr
                    key={cx.id}
                    id={`row-${cx.id}`}
                    onClick={() => onSelectCrossing(cx)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition ${
                      selectedCrossing?.id === cx.id ? 'bg-teal-500/10 hover:bg-teal-500/15' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-200">
                      <div>{cx.name}</div>
                      {cx.name_en && (
                        <div className="text-[10px] text-slate-500 font-mono font-normal mt-0.5">{cx.name_en}</div>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">{cx.country}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-[10.5px] text-slate-400">
                        {cx.layer === 'rail' ? 'ریلی' : cx.layer === 'combined' ? 'ریلی/جاده‌ای' : 'جاده‌ای'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-cyan-400 text-[11px]">{cx.highway || '—'}</td>
                    <td className="p-3 text-amber-400 font-medium">
                      {cx.clear_est ? `~${cx.clear_est} ساعت` : 'جزئی'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        {cx.status === 'فعال' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : cx.status === 'نیمه فعال' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />
                        )}
                        <span className={`text-[10.5px] font-semibold ${
                          cx.status === 'فعال' ? 'text-emerald-400' : cx.status === 'نیمه فعال' ? 'text-amber-400' : 'text-rose-500'
                        }`}>
                          {cx.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    هیچ مورد منطبق با فیلترها پیدا نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination summary stats */}
        <div className="mt-3 text-slate-500 text-[11px] flex justify-between font-mono">
          <span>{filteredCrossings.length} OF {crossings.length} SHOWN</span>
          <span className="text-teal-400/80">IRICA & CAREC JOINT INTEGRATION DATABASE</span>
        </div>
      </div>

      {/* Details Inspector drawer card: span 1 */}
      <div className="bg-slate-950/65 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl h-full flex flex-col overflow-hidden shadow-xl">
        {selectedCrossing ? (
          <div className="space-y-4 flex flex-col h-full overflow-y-auto pr-1">
            <div className="border-b border-slate-800/60 pb-3">
              <span className="text-[9.5px] font-mono tracking-widest text-teal-400 block mb-0.5">GATE INSPECTOR</span>
              <h3 className="text-lg font-bold text-slate-200">{selectedCrossing.name}</h3>
              {selectedCrossing.name_en && (
                <span className="text-xs text-slate-500 font-mono block -mt-0.5">{selectedCrossing.name_en}</span>
              )}
              {selectedCrossing.opp_name && (
                <div className="text-[11px] text-slate-400 mt-1">
                  <span>سازمان متناظر در مرز مقابل: </span>
                  <span className="font-semibold text-purple-300">{selectedCrossing.opp_name}</span>
                </div>
              )}
            </div>

            {/* Geographical Stats card */}
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/50 text-[11.5px] space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">کشور مرزی:</span>
                <span className="text-slate-200 font-medium">{selectedCrossing.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">شاهراه دسترسی ملی:</span>
                <span className="text-cyan-400 font-mono font-semibold">{selectedCrossing.highway || 'جاده مرزی'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">موقعیت جغرافیایی:</span>
                <span className="text-slate-200 font-mono text-left select-text">
                  {selectedCrossing.lat.toFixed(4)} N, {selectedCrossing.lng.toFixed(4)} E
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">سطح پایانه:</span>
                <span className="text-slate-200 font-mono text-left select-text">
                  XG ID: {selectedCrossing.xg_id || 'نامشخص'}
                </span>
              </div>
            </div>

            {/* Capacity KPI section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800/40 pb-1">
                <Activity className="h-4 w-4 text-teal-400" />
                <span>ظرفیت جریان ترانزیت روزانه</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/40">
                  <span className="text-[9px] text-slate-500 font-mono block">TRUCKS CAP (DAILY)</span>
                  <span className="text-sm font-bold text-teal-400 mt-0.5">{selectedCrossing.trucks || 'تخمینی (~۲۰۰)'}</span>
                </div>
                <div className="bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/40">
                  <span className="text-[9px] text-slate-500 font-mono block">WAGONS CAP (DAILY)</span>
                  <span className="text-sm font-bold text-purple-400 mt-0.5">{selectedCrossing.wagons || 'فاقد ساختار ریلی'}</span>
                </div>
              </div>

              <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-800/40 text-[11.5px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">انبارداری سرپوشیده:</span>
                  <span className="text-slate-200">{selectedCrossing.warehouse || 'تخمین محدود'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">زنجیره سرد (سردخانه):</span>
                  <span className="text-slate-200">{selectedCrossing.cold || 'فقط بهداشت فیزیکی'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">عرض انبار ساحلی (Yard):</span>
                  <span className="text-slate-200">{selectedCrossing.depth || '۳۰,۰۰۰ مترمربع'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ساعت کار تابستانه:</span>
                  <span className="text-amber-400 font-semibold">{selectedCrossing.hours_summer || '۲۴ ساعته (تجاری)'}</span>
                </div>
                {selectedCrossing.clearance && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">رژیم ترخیص:</span>
                    <span className="text-slate-200">{selectedCrossing.clearance}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Note remarks from customs board */}
            {selectedCrossing.note && (
              <div className="bg-cyan-500/5 border border-cyan-500/25 p-3 rounded-xl">
                <h5 className="text-[10.5px] font-bold text-cyan-300 mb-1 flex items-center gap-1">
                  <span>توضیحات و گزارش میدانی گمرک:</span>
                </h5>
                <p className="text-[10.5px] text-slate-300 leading-relaxed font-light">{selectedCrossing.note}</p>
              </div>
            )}

            {/* Google maps link */}
            <div className="mt-auto pt-4 border-t border-slate-800/60">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedCrossing.lat},${selectedCrossing.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-300 hover:text-teal-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <MapIcon className="h-4 w-4" />
                <span>مشاهده موقعیت روی اطلس گوگل مپس</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Empty Inspector */
          <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 py-10 scale-95">
            <FileSpreadsheet className="h-10 w-10 text-slate-600 mb-3 animate-pulse" />
            <h3 className="text-xs font-semibold text-slate-300 mb-1">بازرس گمرکی مرز</h3>
            <p className="text-[10.5px] text-slate-500 leading-relaxed max-w-xs font-light">
              یک پایانه مرزی را از جدول به چپ انتخاب کنید تا مشخصات دقیق عملکردی، پهنای زنجیره سرد، فواصل عبوری و یادداشت‌های استراتژیک بارگیری گردد.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
export default CrossingsDirectories;
