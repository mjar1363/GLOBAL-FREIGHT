import React, { useMemo, useState } from 'react';
import { XD } from '../data/databaseDocs';
import { 
  Database, HelpCircle, Layers3, Shuffle, ChevronLeft, 
  TableProperties, Sparkles, Network, CircleDot, Terminal
} from 'lucide-react';

export const MethodologyViewer: React.FC = () => {
  const [activeSheetName, setActiveSheetName] = useState<string>('متدولوژی درخت افکار (ToT)');

  // Retrieve sheets from XML databaseDocs Group 1
  const sheets = useMemo(() => {
    const group1 = XD.groups.find(g => g.name === 'روش‌شناسی درخت افکار (ToT) و جستجوی سطحی (BFS)');
    return group1?.sheets || [];
  }, []);

  const activeSheet = useMemo(() => {
    return sheets.find(s => s.n === activeSheetName) || sheets[0];
  }, [sheets, activeSheetName]);

  // Rings visualization data
  const rings = [
    { ring: 'حلقه ۰', title: 'هسته لجستیک ایران', desc: 'مبدا مرکزی یگانه‌سازی جریان کالا (قلمرو ارضی ایران)', color: 'border-teal-500/30 bg-teal-500/5 text-teal-300' },
    { ring: 'حلقه ۱', title: 'همسایگان مرزی بلاواسطه', desc: 'ترکیه، عراق، آذربایجان، ارمنستان، ترکمنستان، افغانستان، پاکستان، خلیج فارس', color: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300' },
    { ring: 'حلقه ۲', title: 'آسیای مرکزی و قفقاز', desc: 'قزاقستان، ازبکستان، تاجیکستان، قرقیزستان، گرجستان', color: 'border-amber-500/30 bg-amber-500/5 text-amber-300' },
    { ring: 'حلقه ۳', title: 'شرکای فرامنطقه‌ای استراتژیک', desc: 'روسیه، چین، هند، سوریه، کشورهای پیشرفته برادر', color: 'border-purple-500/30 bg-purple-500/5 text-purple-300' },
    { ring: 'حلقه ۴', title: 'ترمینال‌های قاره‌ای نهایی', desc: 'آلمان، بلغارستان، یونان، مغولستان، مبادی عمقی اروپا', color: 'border-rose-500/30 bg-rose-500/5 text-rose-300' },
  ];

  return (
    <div id="methodology-viewer-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full text-right p-1 overflow-hidden">
      
      {/* Left panel: Sheets list and BFS diagram: span 1 */}
      <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto h-full pr-1">
        
        {/* Visual BFS ring card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4.5 space-y-4 select-none">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Network className="h-4.5 w-4.5 text-teal-400" />
            <span>ساختار لایه‌بندی BFS زنجیره تامین</span>
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed font-light mt-0.5">
            نمایش سلسله‌مراتبی لایه‌ها مبتنی بر گام‌بندی الگوریتم جستجوی سطحی از مرکز جغرافیایی ایران به افق تجارت جهانی:
          </p>

          <div className="space-y-2">
            {rings.map((r, idx) => (
              <div
                key={`ring-vis-${idx}`}
                className={`p-2.5 rounded-xl border flex flex-col gap-0.5 ${r.color}`}
              >
                <div className="flex justify-between items-center text-xs font-bold font-mono">
                  <span>{r.ring}</span>
                  <span>{r.title}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-light leading-normal">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sheets navigation list */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 select-none uppercase tracking-widest font-mono">
            لیست برگه‌های روش‌شناسی ToT
          </h3>
          <div className="space-y-1.5">
            {sheets.map((sh, idx) => {
              const isSelected = activeSheetName === sh.n;
              return (
                <div
                  key={`sheet-tab-nav-${idx}`}
                  onClick={() => setActiveSheetName(sh.n)}
                  className={`p-3 rounded-xl border text-right transition cursor-pointer select-none flex justify-between items-center ${
                    isSelected
                      ? 'bg-slate-900 border-teal-500/30'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/45 hover:border-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-semibold text-slate-200">{sh.n}</h4>
                    <p className="text-[10px] text-slate-500">شماره برگه: {idx + 1}</p>
                  </div>
                  <ChevronLeft className={`h-4 w-4 ${isSelected ? 'text-teal-400' : 'text-slate-600'}`} />
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right panel: Tabular Spreadsheet: span 2 */}
      <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl flex flex-col overflow-hidden h-full">
        <div className="border-b border-slate-800/60 pb-3 mb-4">
          <span className="text-[9.5px] font-mono tracking-widest text-teal-400 block mb-0.5">EXCEL SHEET INTERACTIVE VIEW</span>
          <h2 className="text-base font-extrabold text-slate-100">{activeSheetName}</h2>
          <p className="text-[10.5px] text-slate-500 font-mono font-semibold-mt-0.5 uppercase">
            Tree of Thoughts (ToT) BFS Exploration Ledger
          </p>
        </div>

        {/* Sheet description */}
        {activeSheet.d && activeSheet.d.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl text-[11px] text-slate-400 leading-relaxed font-light mb-4 space-y-1">
            {activeSheet.d.map((descLine, dIdx) => (
              <p key={`desc-ln-${dIdx}`}>{descLine}</p>
            ))}
          </div>
        )}

        {/* Excel Matrix Table view */}
        <div className="flex-grow overflow-auto border border-slate-800/60 rounded-xl select-none">
          <table className="w-full text-right text-xs table-fixed">
            <thead className="bg-slate-900/90 py-3 text-slate-400 border-b border-slate-800 sticky top-0 font-medium z-10">
              <tr>
                {activeSheet.h && activeSheet.h.map((header, hIdx) => {
                  // Skip empty first column
                  if (!header && hIdx === 0) return <th key={`th-${hIdx}`} className="p-3 w-10">#</th>;
                  return (
                    <th key={`th-${hIdx}`} className="p-3 font-semibold text-slate-300">
                      {header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 bg-slate-900/5">
              {activeSheet.r && activeSheet.r.length > 0 ? (
                activeSheet.r.map((rowArr, rIdx) => (
                  <tr
                    key={`tr-row-${rIdx}`}
                    className="hover:bg-slate-800/20 transition duration-150"
                  >
                    {rowArr.map((cell, cIdx) => {
                      if (cIdx === 0) return <td key={`td-cell-${rIdx}-${cIdx}`} className="p-3 text-slate-600 font-mono w-10">{rIdx + 1}</td>;
                      
                      // Highlight special markers or ring tags
                      const isRing = typeof cell === 'string' && cell.startsWith('حلقه');
                      const isHeaderLabel = activeSheet.h && !activeSheet.h[cIdx] && cell;

                      return (
                        <td
                          key={`td-cell-${rIdx}-${cIdx}`}
                          className={`p-3 leading-relaxed font-sans ${
                            isRing 
                              ? 'text-teal-400 font-bold bg-teal-500/5' 
                              : isHeaderLabel 
                              ? 'text-slate-200 font-extrabold border-r border-slate-800 pl-4' 
                              : 'text-slate-300 font-light'
                          }`}
                        >
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeSheet.h?.length || 4} className="p-6 text-center text-slate-500">
                    این برگه فاقد جدول آماری است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Spreadsheet footer tag */}
        <div className="mt-3 text-[10px] font-mono text-slate-500 flex justify-between select-none">
          <span>{activeSheet.r?.length || 0} CELLS LOADED MATRIX</span>
          <span className="text-emerald-500/80">BFS DECISION ENGINE WORKSHEETS</span>
        </div>
      </div>

    </div>
  );
};
export default MethodologyViewer;
