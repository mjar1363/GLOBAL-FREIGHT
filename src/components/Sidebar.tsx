import React from 'react';
import { Map, ListFilter, BarChart3, HelpCircle, Globe, Truck, Info } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
  description: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  title,
  description
}) => {
  const menuItems = [
    { id: 'pathmap', label: 'نقشه و مسیریاب هوشمند', icon: Map, color: 'text-teal-400 border-teal-500/20' },
    { id: 'customs', label: 'دایرکتوری مرزی ایران', icon: ListFilter, color: 'text-cyan-400 border-cyan-500/20' },
    { id: 'capacity', label: 'ظرفیت و نقاط گلوگاه', icon: BarChart3, color: 'text-amber-400 border-amber-500/20' },
    { id: 'supply', label: 'پروفایل زنجیره تامین کالا', icon: Globe, color: 'text-purple-400 border-purple-500/20' },
    { id: 'methodology', label: 'متدولوژی درخت افکار ToT', icon: HelpCircle, color: 'text-emerald-400 border-emerald-500/20' }
  ];

  return (
    <div id="sidebar-container" className="flex flex-col h-full bg-slate-950/70 border-r border-slate-800/80 p-5 md:w-80 w-full flex-shrink-0 backdrop-blur-xl">
      <div id="sidebar-header" className="mb-8 flex items-center gap-3">
        <div id="brand-logo" className="p-2.5 bg-gradient-to-tr from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.15)] flex items-center justify-center">
          <Truck className="h-6 w-6 text-teal-400 animate-pulse animate-duration-1000" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent select-none font-display">
            {title}
          </h1>
          <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500 block -mt-1 font-semibold">
            Silk Road Pathfinder v5.0
          </span>
        </div>
      </div>

      <div id="app-description" className="text-xs text-slate-400 mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 leading-relaxed font-light">
        {description}
      </div>

      <nav id="sidebar-nav" className="flex flex-col gap-1.5 flex-grow">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm transition-all duration-300 border text-right select-none ${
                isActive
                  ? 'bg-slate-900/95 border-teal-500/40 text-teal-300 shadow-[inset_0_1px_3px_rgba(255,255,255,0.05),0_4px_12px_rgba(20,184,166,0.1)]'
                  : 'bg-transparent border-transparent hover:bg-slate-900/55 hover:border-slate-800/70 text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
              <span className="font-medium flex-grow">{item.label}</span>
              {isActive && (
                <div id="active-nav-indicator" className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div id="sidebar-footer" className="mt-auto pt-4 border-t border-slate-800/50 flex flex-col gap-2">
        <div id="footer-system-status" className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-400 font-medium">پایگاه داده آفلاین</span>
          </span>
          <span>JUNE 2026</span>
        </div>
        <div id="footer-creator" className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
          <Info className="h-3.5 w-3.5 text-slate-600" />
          <span>پروژه پیاده‌سازی گمرکی راه ابریشم</span>
        </div>
      </div>
    </div>
  );
};
