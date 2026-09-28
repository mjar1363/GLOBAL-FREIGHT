import React, { useMemo, useState } from 'react';
import { XD } from '../data/databaseDocs';
import { 
  BarChart, TrendingUp, AlertOctagon, Info, Flag, Scale, 
  Settings, Zap, ShieldCheck, Hourglass
} from 'lucide-react';

export const CorridorsDashboard: React.FC = () => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Retrieve the tabular sheets safely from databaseDocs
  const dashboardSheet = useMemo(() => {
    const group2 = XD.groups.find(g => g.name === 'داشبورد مقایسه‌ای و ظرفیت جامع حمل‌ونقل');
    return group2?.sheets.find(s => s.n === 'داشبورد مقایسه‌ای');
  }, []);

  // Process rows into separate categories: Chart Corridors, Key Stats, Bottlenecks
  const dataCategories = useMemo(() => {
    if (!dashboardSheet?.r) return { corridors: [], stats: [], bottlenecks: [] };

    const corridors: any[] = [];
    const stats: any[] = [];
    const bottlenecks: any[] = [];

    let currentSection: 'corridor' | 'stats' | 'bottlenecks' = 'corridor';

    for (const row of dashboardSheet.r) {
      const col1 = row[1];
      const col2 = row[2];

      if (col1 === 'آمار کلیدی') {
        currentSection = 'stats';
        continue;
      }
      if (col1 === 'گلوگاه‌های بحرانی') {
        currentSection = 'bottlenecks';
        continue;
      }

      if (currentSection === 'corridor' && col1 && !isNaN(Number(col1))) {
        // Parse volume integers
        const currVolStr = row[4].replace('~', '').split('-')[0];
        const currVol = parseFloat(currVolStr) || 4;
        
        const potVolStr = row[5].replace('+', '').replace(' (ریل)', '');
        const potVol = parseFloat(potVolStr) || 12;

        corridors.push({
          rank: col1,
          country: col2,
          name: row[3],
          currentVol: currVol,
          currentVolStr: row[4],
          potentialVol: potVol,
          potentialVolStr: row[5],
          share: row[6]
        });
      } else if (currentSection === 'stats' && col1) {
        stats.push({
          metric: col1,
          value: col2,
          source: row[3] || 'سازمان بنادر'
        });
      } else if (currentSection === 'bottlenecks' && col1) {
        bottlenecks.push({
          trouble: col1,
          impact: col2,
          state: row[3] || 'بحرانی'
        });
      }
    }

    return { corridors, stats, bottlenecks };
  }, [dashboardSheet]);

  const { corridors, stats, bottlenecks } = dataCategories;

  return (
    <div id="corridors-dashboard-tab" className="space-y-6 text-right p-1 overflow-y-auto h-full">
      
      {/* Introduction Banner header */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
        <div id="intro-card" className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-400" />
              <span>ظرفیت حمل‌ونقل و رتبه‌بندی مجاری ترانزیتی ایران</span>
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed font-light mt-1">
              تحلیل ظرفیت ترانزیتی و مبادله‌ای گمرک‌های کشور با همسایگان زمینی، رقبای منطقه‌ای و شریان‌های جهانی بر پایه تناژ سالانه جابجایی بار.
            </p>
          </div>
          <div className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-semibold text-amber-300">
            تخمین نهایی: JUNE 2026
          </div>
        </div>
      </div>

      {/* SVG Comparative Chart & Detailed Lists Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* SVG Bar Chart panel: span 3 */}
        <div className="lg:col-span-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl flex flex-col h-full">
          <div className="border-b border-slate-800/60 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-200">مقایسه حجم مبادله کنونی در برابر ظرفیت بالقوه (میلیون تن / سال)</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">ESTIMATED CURRENT vs POTENTIAL CAPACITY SCALE (MILLION TONS/YEAR)</p>
          </div>

          {/* Clean responsive Custom SVG Bar Chart */}
          <div className="flex-grow w-full relative min-h-[340px]">
            <svg viewBox="0 0 500 300" className="w-full h-full select-none">
              {/* Plot Horizontal grid lines and scales */}
              {[0, 10, 20, 30].map((v, i) => {
                const y = 250 - (v / 30) * 200;
                return (
                  <g key={`y-axis-grid-${i}`} opacity={0.2}>
                    <line x1="55" y1={y} x2="480" y2={y} stroke="#64748b" strokeWidth="0.5" strokeDasharray="3, 3" />
                    <text x="35" y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="8" className="font-mono">
                      {v}M
                    </text>
                  </g>
                );
              })}

              <g id="chart-bars">
                {corridors.slice(0, 7).map((c, idx) => {
                  const spacing = 60;
                  const startX = 65 + idx * spacing;
                  
                  // Compute dynamic scale values
                  const barCurrHeight = (c.currentVol / 30) * 200;
                  const barPotHeight = (c.potentialVol / 30) * 200;

                  const currY = 250 - barCurrHeight;
                  const potY = 250 - barPotHeight;

                  const isHovered = hoveredBar === idx;

                  return (
                    <g
                      key={`bar-group-${idx}`}
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="cursor-pointer"
                    >
                      {/* Potential scale column (translucent yellow) */}
                      <rect
                        x={startX}
                        y={potY}
                        width="16"
                        height={barPotHeight}
                        fill="#f59e0b"
                        fillOpacity={isHovered ? 0.35 : 0.15}
                        stroke="#f59e0b"
                        strokeWidth="0.5"
                        strokeDasharray="2, 2"
                        rx="2"
                        className="transition-all duration-300"
                      />
                      {/* Current scale column (solid cyan glow) */}
                      <rect
                        x={startX + 3}
                        y={currY}
                        width="10"
                        height={barCurrHeight}
                        fill="#14b8a6"
                        fillOpacity={isHovered ? 0.9 : 0.75}
                        stroke="#2dd4bf"
                        strokeWidth="0.5"
                        rx="1"
                        className="transition-all duration-300"
                      />

                      {/* X axis labels (country abbreviated) */}
                      <text
                        x={startX + 8}
                        y="265"
                        textAnchor="middle"
                        fill={isHovered ? '#38bdf8' : '#94a3b8'}
                        fontSize="8.5"
                        fontWeight={isHovered ? 'bold' : 'normal'}
                        className="font-sans"
                      >
                        {c.country}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Baseline axis */}
              <line x1="50" y1="250" x2="490" y2="250" stroke="#475569" strokeWidth="1" />
            </svg>

            {/* Custom chart tooltip popup */}
            {hoveredBar !== null && corridors[hoveredBar] && (
              <div className="absolute top-2 left-2 bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-2xl max-w-xs transition-opacity animate-fade-in text-[11px] space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 block">SELECTED TRANSIT PATH</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                  <Flag className="h-3.5 w-3.5 text-amber-500" />
                  <span>کریدور کشور {corridors[hoveredBar].country}</span>
                </div>
                <div className="text-slate-400 font-light leading-relaxed mt-1">
                  محدوده گذرگاه: <span className="text-slate-200 font-medium">{corridors[hoveredBar].name}</span>
                </div>
                <div className="flex justify-between pt-1 text-teal-400">
                  <span>حجم ترانزیت فعلی:</span>
                  <span className="font-bold">{corridors[hoveredBar].currentVolStr} میلیون تن</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>ظرفیت بالقوه توسعه:</span>
                  <span className="font-bold">{corridors[hoveredBar].potentialVolStr} میلیون تن / سال</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono text-left pt-1 border-t border-slate-800/40">
                  سهم ایران از تجارت مرزی: {corridors[hoveredBar].share}
                </div>
              </div>
            )}
            
            {/* Chart Legend key lines */}
            <div className="absolute bottom-1 right-2.5 flex items-center gap-4 text-[10px] text-slate-400 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded bg-teal-500/80 border border-teal-400" />
                <span>تناژ ترانزیت واقعی (تناژ بر سال)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded bg-amber-500/10 border border-amber-500/40 border-dashed" />
                <span>ظرفیت فیزیکی بالقوه اسمی مرزها</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chokepoints (Bottlenecks) panel: span 2 */}
        <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl flex flex-col h-full">
          <div className="border-b border-slate-800/60 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <AlertOctagon className="h-4.5 w-4.5 text-rose-500" />
              <span>گلوگاه‌های ترانزیتی بحرانی</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">CRITICAL INFRASTRUCTURE BOTTLENECKS</p>
          </div>

          <div className="space-y-3 overflow-y-auto flex-grow max-h-[300px] pr-1">
            {bottlenecks.map((b, idx) => {
              let color = 'border-slate-800 bg-slate-900/30 text-slate-300';
              if (b.state === '⭐ متوقف') color = 'border-rose-500/30 bg-rose-500/5 text-rose-200';
              else if (b.state === 'تشدید') color = 'border-amber-500/30 bg-amber-500/5 text-amber-200';
              else if (b.state === '⚠️ نیاز به پایش') color = 'border-purple-500/30 bg-purple-500/5 text-purple-200';

              return (
                <div
                  key={`tb-el-${idx}`}
                  className={`p-3 rounded-xl border flex flex-col gap-1 text-right select-none ${color}`}
                >
                  <div className="flex justify-between items-center text-xs font-bold leading-normal">
                    <span>{b.trouble}</span>
                    <span className="text-[9.5px] px-2 py-0.5 bg-slate-950 border border-slate-800/60 rounded text-slate-400 font-semibold font-sans">
                      {b.state}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5 leading-relaxed">
                    پیامد عملکردی: {b.impact}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Key Analytical Insights Statistics summary section */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
        <div className="border-b border-slate-800/60 pb-3 mb-4 flex items-center gap-1.5">
          <Info className="h-4.5 w-4.5 text-teal-400" />
          <h3 className="text-sm font-bold text-slate-200">حقایق و بنچمارک‌های آماری کلیدی (June 2026)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {stats.map((st, idx) => (
            <div
              key={`stat-kpi-${idx}`}
              className="p-3 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/60 hover:border-slate-800 rounded-xl transition duration-200 flex flex-col justify-between min-h-[100px] select-none"
            >
              <div className="text-[11.5px] text-slate-400 font-sans leading-relaxed">{st.metric}</div>
              <div className="mt-2">
                <div className="text-sm font-extrabold text-teal-400 bg-teal-500/5 px-2.5 py-1.5 border border-teal-500/10 rounded-lg inline-block font-mono leading-none">
                  {st.value}
                </div>
                <div className="text-[9.5px] text-slate-500 font-mono mt-1 text-left">SOURCE: {st.source}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default CorridorsDashboard;
