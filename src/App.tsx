import { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { InteractiveMap } from './components/InteractiveMap';
import { PathfinderPanel } from './components/PathfinderPanel';
import { CrossingsDirectories } from './components/CrossingsDirectories';
import { CorridorsDashboard } from './components/CorridorsDashboard';
import { SupplyChainCenter } from './components/SupplyChainCenter';
import { MethodologyViewer } from './components/MethodologyViewer';
import { buildGraph, findShortestPath } from './utils/routing';
import { Crossing } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('pathmap');
  const [startNode, setStartNode] = useState<string | null>('استانبول (ترکیه)');
  const [endNode, setEndNode] = useState<string | null>('تهران (ایران)');
  const [selectedCrossing, setSelectedCrossing] = useState<Crossing | null>(null);

  const title = "داشبورد ترانزیت و گمرکات راه ابریشم";
  const description = 
    "شبیه‌ساز چندوجهی مسیرهای مواصلاتی، پایانه‌های مرزی، تحلیل ظرفیت‌ها و گلوگاه‌ها، با به‌کارگیری متدولوژی درخت افکار (Tree of Thoughts) و الگوریتم‌های هوشمند جستجوی سطحی (BFS).";

  // Build routing graph once
  const graph = useMemo(() => {
    return buildGraph();
  }, []);

  // Compute transit path dynamically using Dijkstra pathfinder
  const routingResult = useMemo(() => {
    if (startNode && endNode) {
      return findShortestPath(graph, startNode, endNode);
    }
    return null;
  }, [graph, startNode, endNode]);

  const activePath = routingResult ? routingResult.path : null;
  const activeSteps = routingResult ? routingResult.steps : null;

  // Sync selected crossing callback with layout tab selection
  const handleSelectCrossing = (cx: Crossing | null) => {
    setSelectedCrossing(cx);
    // If we select a crossing from directory but map tab is closed, automatically navigate page back to map inspect
    if (cx && activeTab !== 'pathmap' && activeTab !== 'customs') {
      setActiveTab('pathmap');
    }
  };

  const handleSelectStart = (nodeId: string) => {
    setStartNode(nodeId);
    if (endNode === nodeId) {
      setEndNode(null);
    }
  };

  const handleSelectEnd = (nodeId: string) => {
    setEndNode(nodeId);
    if (startNode === nodeId) {
      setStartNode(null);
    }
  };

  return (
    <div 
      id="main-app" 
      className="flex flex-col md:flex-row h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased text-right"
      dir="rtl"
    >
      {/* Sidebar Controller */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        title={title} 
        description={description} 
      />

      {/* Primary Workspace screen */}
      <main id="workspace-main" className="flex-grow h-full p-4 md:p-6 overflow-hidden flex flex-col min-w-0 bg-gradient-to-br from-slate-950 via-slate-900/60 to-slate-950">
        
        {/* Dynamic Inner Tab container */}
        <div id="tab-content" className="flex-grow overflow-hidden h-full relative">
          {activeTab === 'pathmap' && (
            <div id="tab-pathmap" className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full overflow-hidden">
              {/* Interactive map visualization: taking 3/5 weight */}
              <div id="map-cell" className="lg:col-span-3 h-full overflow-hidden">
                <InteractiveMap
                  startNode={startNode}
                  endNode={endNode}
                  activePath={activePath}
                  activeSteps={activeSteps}
                  selectedCrossing={selectedCrossing}
                  onSelectCrossing={handleSelectCrossing}
                  onSelectStart={handleSelectStart}
                  onSelectEnd={handleSelectEnd}
                  graphNodes={graph.nodes}
                />
              </div>

              {/* Path routing controls list: taking 2/5 weight */}
              <div id="panel-cell" className="lg:col-span-2 h-full overflow-hidden">
                <PathfinderPanel
                  startNode={startNode}
                  setStartNode={setStartNode}
                  endNode={endNode}
                  setEndNode={setEndNode}
                  activePath={activePath}
                  activeSteps={activeSteps}
                  routingResult={routingResult}
                  graphNodes={graph.nodes}
                  onSelectCrossing={handleSelectCrossing}
                />
              </div>
            </div>
          )}

          {activeTab === 'customs' && (
            <div id="tab-customs" className="h-full overflow-hidden">
              <CrossingsDirectories 
                onSelectCrossing={handleSelectCrossing} 
                selectedCrossing={selectedCrossing} 
              />
            </div>
          )}

          {activeTab === 'capacity' && (
            <div id="tab-capacity" className="h-full overflow-hidden">
              <CorridorsDashboard />
            </div>
          )}

          {activeTab === 'supply' && (
            <div id="tab-supply" className="h-full overflow-hidden">
              <SupplyChainCenter />
            </div>
          )}

          {activeTab === 'methodology' && (
            <div id="tab-methodology" className="h-full overflow-hidden">
              <MethodologyViewer />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
