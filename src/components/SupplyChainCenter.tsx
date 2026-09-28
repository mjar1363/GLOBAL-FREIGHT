import React, { useMemo, useState } from 'react';
import { SUP } from '../data/supplyData';
import { 
  Globe2, Landmark, Users, CreditCard, ChevronLeft, 
  CornerDownLeft, ShieldCheck, Scale, Compass, Layers3, Flame
} from 'lucide-react';

export const SupplyChainCenter: React.FC = () => {
  const [selectedCountryName, setSelectedCountryName] = useState<string>('ایران');

  const selectedCountry = useMemo(() => {
    return SUP.countries.find(c => c.n === selectedCountryName) || SUP.countries[0];
  }, [selectedCountryName]);

  // Compute maximum sector export value to scale sector bars relative to each other
  const maxExportValue = useMemo(() => {
    if (!selectedCountry?.top) return 1;
    let max = 1;
    selectedCountry.top.forEach(([_, valStr]) => {
      // Parse float value from Persian values like "۱۵.۲ میلیارد دلار" or "۳۵۰ میلیارد دلار"
      const numbers = valStr.replace('میلیارد دلار', '').replace(' ', '');
      // Translate Persian digits to English if any
      const engStr = numbers
        .replace(/۰/g, '0')
        .replace(/۱/g, '1')
        .replace(/۲/g, '2')
        .replace(/۳/g, '3')
        .replace(/۴/g, '4')
        .replace(/۵/g, '5')
        .replace(/۶/g, '6')
        .replace(/۷/g, '7')
        .replace(/۸/g, '8')
        .replace(/۹/g, '9');
      
      const parsed = parseFloat(engStr);
      if (parsed > max) max = parsed;
    });
    return max;
  }, [selectedCountry]);

  return (
    <div id="supply-chain-center-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full text-right p-1">
      
      {/* Visual selector grid column on the Left: span 1 */}
      <div className="lg:col-span-1 flex flex-col gap-3.5 h-full overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-400 select-none uppercase tracking-widest font-mono">
          انتخاب قلمرو تجاری زنجیره تامین
        </h3>

        {SUP.countries.map((c, idx) => {
          const isSelected = selectedCountryName === c.n;
          return (
            <div
              key={`country-sel-card-${idx}`}
              onClick={() => setSelectedCountryName(c.n)}
              className={`p-4 rounded-2xl border text-right transition cursor-pointer select-none flex justify-between items-center ${
                isSelected
                  ? 'bg-slate-900 border-teal-500/30 shadow-[0_4px_20px_rgba(20,184,166,0.1)]'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/45 hover:border-slate-800'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 block uppercase">
                  {c.en} LOGISTIC SYSTEM
                </span>
                <h4 className="text-sm font-bold text-slate-200">{c.n}</h4>
                <p className="text-[10.5px] text-slate-400 font-light mt-0.5 leading-normal truncate max-w-[180px]">
                  {c.iran}
                </p>
              </div>
              
              <div className={`p-2 rounded-xl border transition ${
                isSelected ? 'bg-teal-500/10 border-teal-500/20 text-teal-300' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <Globe2 className="h-4.5 w-4.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Profiles inspector panel on the Right: span 2 */}
      <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl flex flex-col overflow-hidden h-full">
        {selectedCountry ? (
          <div className="space-y-5 overflow-y-auto flex-grow pr-1">
            
            {/* Header with Title and basic KPIs */}
            <div className="border-b border-slate-800/60 pb-3.5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-teal-400 block mb-0.5">TERRITORIAL SUPPLY CARD</span>
                <h2 className="text-base font-extrabold text-slate-100">{selectedCountry.n} (زنجیره لجستیک)</h2>
                <p className="text-[10.5px] text-slate-500 font-mono font-semibold-mt-0.5 uppercase">
                  {selectedCountry.en} Supply System Profiler
                </p>
              </div>

              {selectedCountry.kpi && (
                <div className="flex gap-2">
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
                    <span className="text-[9px] text-slate-500 block">جمعیت</span>
                    <span className="text-xs font-bold text-slate-300">{selectedCountry.kpi.pop}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
                    <span className="text-[9px] text-slate-500 block">ارز</span>
                    <span className="text-xs font-bold text-slate-300">{selectedCountry.customs?.includes('اوراسیا') ? 'روبل/ریال' : selectedCountry.kpi.cur ? selectedCountry.kpi.cur.split(' ')[0] : 'سایر'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Comprehensive KPI Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-3 flex gap-3 items-center">
                <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-lg">
                  <Landmark className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-mono">GROSS DOMESTIC PRODUCT</span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5">{selectedCountry.kpi?.gdp || '—'}</span>
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-3 flex gap-3 items-center">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                  <CreditCard className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-mono">TOTAL EXPORTS VALUE</span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5">{selectedCountry.kpi?.exp || '—'}</span>
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-3 flex gap-3 items-center">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
                  <Flame className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-mono">TRADE WITH IRAN</span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5">{selectedCountry.itx || '—'}</span>
                </div>
              </div>
            </div>

            {/* Trading sectors bar visualization */}
            {selectedCountry.top && (
              <div className="space-y-3.5 border-t border-slate-800/40 pt-4 select-none">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers3 className="h-4.5 w-4.5 text-teal-400" />
                  <span>عمده‌ترین بخش‌های صادراتی / تولیدی کشور</span>
                </h3>

                <div className="space-y-2">
                  {selectedCountry.top.map(([sector, valueStr], sIdx) => {
                    const parsedVal = parseFloat(
                      valueStr
                        .replace('میلیارد دلار', '')
                        .replace(' ', '')
                        .replace(/۰/g, '0')
                        .replace(/۱/g, '1')
                        .replace(/۲/g, '2')
                        .replace(/۳/g, '3')
                        .replace(/۴/g, '4')
                        .replace(/۵/g, '5')
                        .replace(/۶/g, '6')
                        .replace(/۷/g, '7')
                        .replace(/۸/g, '8')
                        .replace(/۹/g, '9')
                    ) || 1;
                    
                    const percent = Math.min((parsedVal / maxExportValue) * 100, 100);

                    return (
                      <div key={`sector-bar-${sIdx}`} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-300">{sector}</span>
                          <span className="text-teal-400 font-mono">{valueStr}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Structured Logistics, customs regulations grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/40 pt-4">
              
              <div className="bg-slate-900/30 p-3.5 rounded-xl border border-slate-800/50 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-teal-300 text-xs">
                  <ShieldCheck className="h-4 w-4 text-teal-400" />
                  <span>مزیت رقابتی و گمرک (Regime)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  {selectedCountry.customs || 'دارای رژیم تسهیلات گمرکات ترجیحی با سازمان گمرک جمهوری اسلامی ایران.'}
                </p>
              </div>

              <div className="bg-slate-900/30 p-3.5 rounded-xl border border-slate-800/50 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                  <Compass className="h-4 w-4 text-amber-400" />
                  <span> مسیرهای ترانزیتی فعال کشور</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  {selectedCountry.transit || 'کریدور ریلی جاده‌ای متصل به مرزهای مرزی ترانزیت جمهوری اسلامی ایران.'}
                </p>
              </div>

            </div>

            {/* High-level system note */}
            {selectedCountry.adv && (
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 select-none">
                  <CornerDownLeft className="h-4 w-4 text-teal-400" />
                  <span>مزیت رقابتی قلمرو در حوزه لجستیک منطقه</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  {selectedCountry.adv}
                </p>
              </div>
            )}

          </div>
        ) : (
          /* Empty Inspector fallback */
          <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 py-10 scale-95">
            <Globe2 className="h-10 w-10 text-slate-600 mb-3 animate-pulse" />
            <h3 className="text-xs font-semibold text-slate-300 mb-1">مکانیزم زنجیره تامین کل منطقه</h3>
            <p className="text-[10.5px] text-slate-500 leading-relaxed max-w-xs font-light">
              یک کشور ترانزیتی را انتخاب نمایید تا تناژ جریان تجاری، شاخص‌های ملی سهم از بازار، مزیت گمرکی، تعرفه‌ها و فرآیندهای لجستیکی کالا تفکیک گردد.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
export default SupplyChainCenter;
