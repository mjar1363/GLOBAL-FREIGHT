import React, { useMemo, useState } from 'react';
import { 
  Navigation, ArrowRightLeft, Flag, HelpCircle, 
  MapPin, Clock, Truck, ShieldAlert, Sparkles, Route, Info
} from 'lucide-react';
import { Crossing } from '../types';

interface PathfinderPanelProps {
  startNode: string | null;
  setStartNode: (nodeId: string | null) => void;
  endNode: string | null;
  setEndNode: (nodeId: string | null) => void;
  activePath: string[] | null;
  activeSteps: any[] | null;
  routingResult: any | null;
  graphNodes: Map<string, any>;
  onSelectCrossing: (crossing: Crossing | null) => void;
}

export const PathfinderPanel: React.FC<PathfinderPanelProps> = ({
  startNode,
  setStartNode,
  endNode,
  setEndNode,
  activePath,
  activeSteps,
  routingResult,
  graphNodes,
  onSelectCrossing
}) => {
  const [startSearch, setStartSearch] = useState('');
  const [endSearch, setEndSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<'start' | 'end' | null>(null);

  // Separate nodes into Iran (Destinations) and Region (Origins)
  const allNodesList = useMemo(() => {
    return Array.from(graphNodes.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [graphNodes]);

  const originNodes = useMemo(() => {
    return allNodesList.filter(n => n.country !== 'ایران');
  }, [allNodesList]);

  const destNodes = useMemo(() => {
    return allNodesList.filter(n => n.country === 'ایران');
  }, [allNodesList]);

  // Predefined Presets
  const presets = [
    {
      name: 'کریدور ابریشم نو (اورومچی - تهران)',
      start: 'اورومچی (چین)',
      end: 'تهران (ایران)',
      desc: 'مسیر ریلی-جاده‌ای با گذر از آسیای مرکزی'
    },
    {
      name: 'مسیر ترانزیت ترکیه (استانبول - تهران)',
      start: 'استانبول (ترکیه)',
      end: 'تهران (ایران)',
      desc: 'کریدور کلیدی حمل کالا از اروپا به خاورمیانه'
    },
    {
      name: 'کریدور شمال-جنوب INSTC (مسکو - بندرعباس)',
      start: 'روستوف-نا-دونو (روسیه)',
      end: 'بندرعباس (ایران)',
      desc: 'بزرگنمایی تجاری روسیه از ورودی دریای خلیج فارس'
    },
    {
      name: 'پیش‌فرض تجاری عراق (بغداد - بندرعباس)',
      start: 'بغداد (عراق)',
      end: 'بندرعباس (ایران)',
      desc: 'مسیر اتصالی ترانزیتی بندرعباس-غرب کشور'
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setStartNode(p.start);
    setEndNode(p.end);
    setDropdownOpen(null);
  };

  const filteredOrigins = useMemo(() => {
    if (!startSearch) return originNodes;
    return originNodes.filter(n => 
      n.name.toLowerCase().includes(startSearch.toLowerCase()) || 
      n.country.toLowerCase().includes(startSearch.toLowerCase())
    );
  }, [originNodes, startSearch]);

  const filteredDests = useMemo(() => {
    if (!endSearch) return destNodes;
    return destNodes.filter(n => 
      n.name.toLowerCase().includes(endSearch.toLowerCase()) || 
      n.country.toLowerCase().includes(endSearch.toLowerCase())
    );
  }, [destNodes, endSearch]);

  const swapSelectedPoints = () => {
    const temp = startNode;
    setStartNode(endNode);
    setEndNode(temp);
  };

  return (
    <div id="pathfinder-panel" className="bg-slate-950/65 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl h-full flex flex-col overflow-hidden shadow-xl">
      {/* Panel header */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-3">
        <Navigation className="h-5 w-5 text-teal-400 rotate-45" />
        <div>
          <h2 className="text-sm font-bold text-slate-100">مسیریابی هوشمند ترانزیتی</h2>
          <p className="text-[10px] text-slate-500 font-mono font-semibold">MULTIMODAL SHORTEST PATH FINDER</p>
        </div>
      </div>

      {/* Selectors Inputs */}
      <div className="space-y-3 relative mb-4">
        {/* Origin dropdown selector */}
        <div className="relative">
          <label className="text-[11px] font-medium text-slate-400 block mb-1">نقطه مبدا (کشورهای منطقه):</label>
          <div
            onClick={() => setDropdownOpen(dropdownOpen === 'start' ? null : 'start')}
            className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition"
          >
            <MapPin className="h-4 w-4 text-teal-500" />
            <span className="text-xs text-slate-200 truncate flex-grow">
              {startNode ? startNode : 'مبدا را انتخاب کنید...'}
            </span>
          </div>

          {dropdownOpen === 'start' && (
            <div className="absolute top-[68px] right-0 left-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto p-2">
              <input
                type="text"
                placeholder="جستجوی شهر یا کشور..."
                value={startSearch}
                onChange={(e) => setStartSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-lg mb-2 focus:outline-none focus:border-teal-500 font-sans"
              />
              <div className="space-y-0.5">
                {filteredOrigins.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => {
                      setStartNode(node.id);
                      setDropdownOpen(null);
                    }}
                    className={`p-2 hover:bg-slate-800 rounded-lg text-xs cursor-pointer flex justify-between ${
                      startNode === node.id ? 'bg-teal-500/10 text-teal-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span>{node.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">{node.country}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Swap button inside middle */}
        <div className="flex justify-center -my-1.5 z-10 relative">
          <button
            onClick={swapSelectedPoints}
            className="p-1.5 bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg shadow-md transition"
            title="جابجایی مبدا و مقصد"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 rotate-90" />
          </button>
        </div>

        {/* Destination dropdown selector */}
        <div className="relative">
          <label className="text-[11px] font-medium text-slate-400 block mb-1">نقطه مقصد (ایران):</label>
          <div
            onClick={() => setDropdownOpen(dropdownOpen === 'end' ? null : 'end')}
            className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition"
          >
            <Flag className="h-4 w-4 text-rose-500" />
            <span className="text-xs text-slate-200 truncate flex-grow">
              {endNode ? endNode : 'مقصد را انتخاب کنید...'}
            </span>
          </div>

          {dropdownOpen === 'end' && (
            <div className="absolute top-[68px] right-0 left-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto p-2">
              <input
                type="text"
                placeholder="جستجوی گره در ایران..."
                value={endSearch}
                onChange={(e) => setEndSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-lg mb-2 focus:outline-none focus:border-rose-500 font-sans"
              />
              <div className="space-y-0.5">
                {filteredDests.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => {
                      setEndNode(node.id);
                      setDropdownOpen(null);
                    }}
                    className={`p-2 hover:bg-slate-800 rounded-lg text-xs cursor-pointer flex justify-between ${
                      endNode === node.id ? 'bg-rose-500/10 text-rose-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span>{node.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">{node.country}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Path Results Metrics Section */}
      <div className="flex-grow overflow-y-auto pr-1">
        {routingResult ? (
          <div className="space-y-4">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 flex flex-col">
                <span className="text-[9px] text-slate-500 font-mono">TOTAL DISTANCE</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-bold text-cyan-300">{routingResult.totalDistanceKm.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-medium">کیلومتر</span>
                </div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 flex flex-col">
                <span className="text-[9px] text-slate-500 font-mono">DRIVING TIME</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-bold text-amber-300">{routingResult.totalDriveHours}</span>
                  <span className="text-[10px] text-slate-400 font-medium">ساعت</span>
                </div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 flex flex-col">
                <span className="text-[9px] text-slate-500 font-mono">BORDER DELAYS</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-bold text-purple-300">~{routingResult.totalBorderHours}</span>
                  <span className="text-[10px] text-slate-400 font-medium">ساعت</span>
                </div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 flex flex-col">
                <span className="text-[9px] text-slate-500 font-mono">GATES crossed</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-bold text-emerald-300">{routingResult.borderCrossingsCount}</span>
                  <span className="text-[10px] text-slate-400 font-medium">دروازه مرزی</span>
                </div>
              </div>
            </div>

            {/* Total Duration Estimate Summary */}
            <div className="bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-semibold text-teal-300">مدت ترانزیت کل فرضی</h4>
                  <p className="text-[10px] text-slate-400">شامل رانندگی مفید و میانگین معطلی مرز</p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-lg font-bold text-teal-200">
                  {Math.round(((routingResult.totalDriveHours + routingResult.totalBorderHours) / 24) * 10) / 10}
                </span>
                <span className="text-[10px] text-teal-400 p-1 font-medium">روز</span>
              </div>
            </div>

            {/* Step-by-Step Route Checklist */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5 select-none">
                <Route className="h-4 w-4 text-teal-400" />
                <span>برنامه گام به گام ترانزیت مسیر</span>
              </h3>
              <div className="border-r border-dashed border-slate-800 mr-2.5 pr-4 space-y-3">
                {routingResult.steps.map((step: any, idx: number) => {
                  const nodeFrom = step.from;
                  const nodeTo = step.to;
                  return (
                    <div key={`step-el-${idx}`} className="relative">
                      {/* Circle Dot Marker */}
                      <span className="absolute -right-[21px] top-1.5 w-2 h-2 rounded-full border border-slate-900 bg-slate-600 shadow-[0_0_5px_rgba(255,255,255,0.15)]" />
                      
                      <div className="text-xs">
                        <div className="flex justify-between items-center text-slate-200 font-medium font-sans">
                          <span>{nodeFrom.name} ← {nodeTo.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-semibold">
                            {idx + 1}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 text-[10.5px] mt-1 text-slate-400">
                          {step.kind === 'border' ? (
                            <span 
                              onClick={() => {
                                if (step.crossing) {
                                  onSelectCrossing(step.crossing);
                                }
                              }}
                              className="text-purple-400 hover:underline cursor-pointer bg-purple-950/20 px-1.5 rounded border border-purple-800/30 font-semibold flex items-center gap-1 mt-0.5"
                            >
                              <ShieldAlert className="h-3 w-3 inline text-purple-400" />
                              دروازه مرز: {step.ref} (تاخیر: ~{step.crossing?.clear_est ? step.crossing.clear_est : 8}h)
                            </span>
                          ) : (
                            <span className="text-cyan-400 font-mono bg-cyan-900/10 px-1.5 rounded border border-cyan-800/20 font-semibold mt-0.5">
                              {step.ref} ({Math.round(step.weight)} کیلومتر)
                            </span>
                          )}
                          <span className="text-slate-500">یافته شده در قلمرو: {nodeFrom.country === nodeTo.country ? nodeFrom.country : `${nodeFrom.country} / ${nodeTo.country}`}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          /* Empty or Preset selection view */
          <div className="space-y-5 py-3">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 text-center flex flex-col items-center">
              <Sparkles className="h-8 w-8 text-teal-400 mb-2 animate-bounce" />
              <h3 className="text-xs font-semibold text-slate-200">مسیریابی آماده انجام است</h3>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                لطفاً نقطه آغازین و پایان را از کادرهای جستجوی بالا انتخاب نمایید یا از پالت پیش‌فرض‌های زیر استفاده کنید.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300">مسیرهای ترانزیتی نمونه کریدور</h3>
              <div className="space-y-1.5">
                {presets.map((p, idx) => (
                  <div
                    key={`preset-el-${idx}`}
                    onClick={() => handleApplyPreset(p)}
                    className="p-2.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800/50 transition duration-200 text-right"
                  >
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <Route className="h-3.5 w-3.5 text-teal-400" />
                      <span>{p.name}</span>
                    </h4>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed font-light">{p.desc}</p>
                    <div className="text-[9px] text-slate-500 mt-1.5 font-mono">
                      {p.start} ───{'>'} {p.end}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-slate-900/20 border border-slate-800/40 rounded-xl flex gap-2">
              <Info className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed font-light">
                مسیریابی در زمان واقعی با ادغام ۲۶ شبکه ترانزیت جاده‌ای منطقه و ۳۲ گمرک اصلی کشور، گلوگاه‌های مرزی و فواصل فیزیکی بر ثانیه را بهینه‌سازی می‌کند.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PathfinderPanel;
