import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DATA } from '../data/crossings';
import { RN } from '../data/roadNetwork';
import { Crossing } from '../types';
import { haversineDistance } from '../utils/routing';
import { 
  ZoomIn, ZoomOut, Maximize2, Layers, MapPin, 
  HelpCircle, Compass, CircleDot, RefreshCw, AlertTriangle
} from 'lucide-react';

interface InteractiveMapProps {
  startNode: string | null;
  endNode: string | null;
  activePath: string[] | null;
  activeSteps: any[] | null;
  selectedCrossing: Crossing | null;
  onSelectCrossing: (crossing: Crossing | null) => void;
  onSelectStart: (nodeId: string) => void;
  onSelectEnd: (nodeId: string) => void;
  graphNodes: Map<string, any>;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  startNode,
  endNode,
  activePath,
  activeSteps,
  selectedCrossing,
  onSelectCrossing,
  onSelectStart,
  onSelectEnd,
  graphNodes
}) => {
  const [mapMode, setMapMode] = useState<'blueprint' | 'satellite'>('blueprint');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const maplibreContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Map limits fitting middle east Silk Road
  const minLat = 22;
  const maxLat = 53;
  const minLng = 25;
  const maxLng = 114;

  // Track map dimensions
  const [mapDim, setMapDim] = useState({ width: 900, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setMapDim({
            width: Math.max(width, 400),
            height: Math.max(height, 500)
          });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Projection helper: coordinates (Lat/Lng) to local SVG bounds
  const project = (lat: number, lng: number) => {
    // Mercator approximation for SVG rendering
    const x = ((lng - minLng) / (maxLng - minLng)) * mapDim.width;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * mapDim.height;
    return { x, y };
  };

  // Compile all cities and crossings positions
  const citiesList = useMemo(() => {
    const list: any[] = [];
    for (const [countryName, countryData] of Object.entries(RN)) {
      for (const r of countryData.routes) {
        for (const [name, lat, lng] of r.c) {
          const id = `${name} (${countryName})`;
          if (!list.some(el => el.id === id)) {
            list.push({ id, name, lat, lng, country: countryName });
          }
        }
      }
    }
    return list;
  }, []);

  const crossingsList = useMemo(() => {
    return (DATA.crossings || []) as Crossing[];
  }, []);

  // Map coordinates projection for rendering
  const projectedRoutes = useMemo(() => {
    const routesArray: any[] = [];
    for (const [countryName, countryData] of Object.entries(RN)) {
      for (const r of countryData.routes) {
        const points = r.c.map(([name, lat, lng]: any) => {
          const proj = project(lat, lng);
          return { name, lat, lng, x: proj.x, y: proj.y };
        });
        routesArray.push({
          ref: r.ref,
          n: r.n,
          country: countryName,
          color: countryData.color,
          points
        });
      }
    }
    return routesArray;
  }, [mapDim]);

  const projectedCrossings = useMemo(() => {
    return crossingsList.map(cx => {
      const proj = project(cx.lat, cx.lng);
      return { ...cx, x: proj.x, y: proj.y };
    });
  }, [crossingsList, mapDim]);

  // Handle zooming to centered selected crossing
  useEffect(() => {
    if (selectedCrossing) {
      const proj = project(selectedCrossing.lat, selectedCrossing.lng);
      setZoom(2.5);
      setPan({
        x: mapDim.width / 2 - proj.x * 2.5,
        y: mapDim.height / 2 - proj.y * 2.5
      });
    }
  }, [selectedCrossing]);

  // Handle svg dragging
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Avoid dragging triggering if clicking on nested elements
    if ((e.target as HTMLElement).tagName !== 'circle' && (e.target as HTMLElement).tagName !== 'text') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.6), 8);
    
    // Zoom toward coordinates
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const pX = (mouseX - pan.x) / zoom;
      const pY = (mouseY - pan.y) / zoom;

      setZoom(newZoom);
      setPan({
        x: mouseX - pX * newZoom,
        y: mouseY - pY * newZoom
      });
    }
  };

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onSelectCrossing(null);
  };

  // Convert Dijkstra coordinates output into SVG lines
  const activePathCoordinates = useMemo(() => {
    if (!activePath || !activeSteps) return null;
    return activeSteps.map(step => {
      const projFrom = project(step.from.lat, step.from.lng);
      const projTo = project(step.to.lat, step.to.lng);
      return {
        fromX: projFrom.x,
        fromY: projFrom.y,
        toX: projTo.x,
        toY: projTo.y,
        kind: step.kind,
        ref: step.ref
      };
    });
  }, [activePath, activeSteps, mapDim]);

  // Maplibre Map renderer
  useEffect(() => {
    if (mapMode !== 'satellite') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    // Dynamic import to avoid SSR errors or environments missing Maplibre elements
    import('maplibre-gl').then((maplibregl) => {
      if (!maplibreContainerRef.current) return;

      try {
        const map = new maplibregl.Map({
          container: maplibreContainerRef.current,
          style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
          center: [53.5, 35.7], // Center over Iran/Caspian region
          zoom: 3.5,
          pitchWithRotate: false
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-right');
        mapInstanceRef.current = map;

        map.on('load', () => {
          // Add sources for routes and crossings inside MapLibre
          // 1. Crossings as source nodes
          const crossingsFeatures = crossingsList.map(cx => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [cx.lng, cx.lat] },
            properties: { id: cx.id, name: cx.name, status: cx.status, type: cx.type }
          }));

          map.addSource('crossings', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: crossingsFeatures }
          });

          // Draw crossings as circle layers
          map.addLayer({
            id: 'crossings-circles',
            type: 'circle',
            source: 'crossings',
            paint: {
              'circle-radius': 6,
              'circle-color': [
                'match', ['get', 'status'],
                'فعال', '#14b8a6',
                'نیمه فعال', '#eab308',
                'مسدود', '#ef4444',
                '#a855f7'
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#030712'
            }
          });

          // Add popups for crossings
          map.on('click', 'crossings-circles', (e: any) => {
            const props = e.features[0].properties;
            const match = crossingsList.find(c => c.id === props.id);
            if (match) {
              onSelectCrossing(match);
            }
          });

          // 2. Plot existing road routes
          const routesFeatures = projectedRoutes.map(r => ({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: r.points.map((p: any) => [p.lng, p.lat])
            },
            properties: { ref: r.ref, country: r.country, color: r.color }
          }));

          map.addSource('logistic-routes', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: routesFeatures }
          });

          map.addLayer({
            id: 'routes-lines',
            type: 'line',
            source: 'logistic-routes',
            paint: {
              'line-color': ['get', 'color'],
              'line-width': 2.5,
              'line-opacity': 0.6
            }
          });

          // 3. Highlight the calculated routing path if existent
          if (activeSteps && activeSteps.length > 0) {
            const pathCoordinates: [number, number][] = [];
            activeSteps.forEach(step => {
              if (pathCoordinates.length === 0) {
                pathCoordinates.push([step.from.lng, step.from.lat]);
              }
              pathCoordinates.push([step.to.lng, step.to.lat]);
            });

            map.addSource('active-route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: pathCoordinates }
              }
            });

            map.addLayer({
              id: 'active-route-lines',
              type: 'line',
              source: 'active-route',
              paint: {
                'line-color': '#00f2fe',
                'line-width': 5,
                'line-dasharray': [2, 2]
              }
            });
          }
        });
      } catch (err) {
        console.error('WebGL failed to initialize:', err);
        setWebGlSupported(false);
        setMapMode('blueprint');
      }
    }).catch(e => {
      console.error('Failed to load maplibre wrapper', e);
      setWebGlSupported(false);
      setMapMode('blueprint');
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapMode, activeSteps]);

  return (
    <div id="map-workspace" className="flex flex-col h-full bg-slate-900/30 rounded-2xl border border-slate-800/40 overflow-hidden relative" ref={containerRef}>
      {/* Map Control Headers */}
      <div id="map-header-bar" className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-800/80 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-1 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400">
            {Math.round(zoom * 100)}% ZOOM
          </div>
          <div className="text-sm font-semibold flex items-center gap-2 select-none">
            <Compass className="h-4 w-4 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>کریدورهای تجارتی و اتصالات فرامرزی</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Map Type Switcher */}
          <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              id="btn-switch-blue"
              onClick={() => setMapMode('blueprint')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                mapMode === 'blueprint' 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              نقشه برداری (Blueprint)
            </button>
            <button
              id="btn-switch-sat"
              onClick={() => {
                if (webGlSupported) {
                  setMapMode('satellite');
                }
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                !webGlSupported ? 'opacity-40 cursor-not-allowed' : ''
              } ${
                mapMode === 'satellite' 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              title={!webGlSupported ? 'در بستر مرورگر شما شتابدهی WebGL در دسترس نیست' : ''}
            >
              نقشه جغرافیایی اطلس
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* View control buttons */}
          <button id="btn-zoom-in" onClick={() => setZoom(z => Math.min(z + 0.3, 8))} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition" title="بزرگنمایی">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button id="btn-zoom-out" onClick={() => setZoom(z => Math.max(z - 0.3, 0.6))} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition" title="کوچکنمایی">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button id="btn-zoom-reset" onClick={resetViewport} className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition" title="تنظیم مجدد">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Map Content View */}
      {mapMode === 'blueprint' ? (
        <svg
          id="vector-blueprint-map"
          ref={svgRef}
          className={`w-full h-full select-none outline-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ backgroundColor: '#020617' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Grid Background */}
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="1" />
            </pattern>
            <pattern id="thick-grid-pattern" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(51, 65, 85, 0.35)" strokeWidth="1.5" />
            </pattern>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-active" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          <rect width="100%" height="100%" fill="url(#thick-grid-pattern)" />

          {/* Transformation Wrapper based on Zoom & Pan */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            
            {/* National Boundaries representation via Road Grouping */}
            {projectedRoutes.map((route, rIdx) => (
              <g id={`route-g-${route.ref}-${rIdx}`} key={`${route.ref}-${rIdx}`} opacity={0.4}>
                <polyline
                  points={route.points.map((p: any) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={2.5 / zoom}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ))}

            {/* Glowing Active Route overlay */}
            {activePathCoordinates && (
              <g id="active-pathway-overlay">
                {activePathCoordinates.map((seg, sIdx) => (
                  <g key={`active-seg-${sIdx}`}>
                    {/* Glowing highlight trace */}
                    <line
                      x1={seg.fromX}
                      y1={seg.fromY}
                      x2={seg.toX}
                      y2={seg.toY}
                      stroke="#00f2fe"
                      strokeWidth={8 / zoom}
                      strokeLinecap="round"
                      opacity={0.35}
                      filter="url(#glow-active)"
                    />
                    {/* Running core trace */}
                    <line
                      x1={seg.fromX}
                      y1={seg.fromY}
                      x2={seg.toX}
                      y2={seg.toY}
                      stroke="#14b8a6"
                      strokeWidth={3.5 / zoom}
                      strokeLinecap="round"
                      strokeDasharray={seg.kind === 'border' ? `${4/zoom}, ${4/zoom}` : undefined}
                    />
                  </g>
                ))}
              </g>
            )}

            {/* Render City Nodes */}
            <g id="map-cities">
              {citiesList.map((node) => {
                const proj = project(node.lat, node.lng);
                const isStart = startNode === node.id;
                const isEnd = endNode === node.id;
                const isPathNode = activePath?.includes(node.id);
                
                return (
                  <g
                    key={node.id}
                    id={`city-node-${node.name}`}
                    transform={`translate(${proj.x}, ${proj.y})`}
                    className="cursor-pointer"
                    onClick={() => {
                      if (!startNode || (startNode && endNode)) {
                        onSelectStart(node.id);
                      } else {
                        onSelectEnd(node.id);
                      }
                    }}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <circle
                      r={isStart || isEnd ? 9 / zoom : isPathNode ? 6 / zoom : 4 / zoom}
                      className="transition-all duration-300"
                      fill={isStart ? '#14b8a6' : isEnd ? '#f43f5e' : isPathNode ? '#06b6d4' : '#1e293b'}
                      stroke={isStart ? '#ccfbf1' : isEnd ? '#ffe4e6' : isPathNode ? '#22d3ee' : '#64748b'}
                      strokeWidth={2 / zoom}
                    />
                    {(isStart || isEnd) && (
                      <circle
                        r={18 / zoom}
                        fill="none"
                        stroke={isStart ? '#14b8a6' : '#f43f5e'}
                        strokeWidth={1 / zoom}
                        className="animate-ping"
                        opacity={0.2}
                      />
                    )}
                  </g>
                );
              })}
            </g>

            {/* Render Custom Port/Crossing nodes */}
            <g id="map-crossings">
              {projectedCrossings.map((cx) => {
                const isSelected = selectedCrossing?.id === cx.id;
                const isPathCrossing = activeSteps?.some(step => step.crossing?.id === cx.id);
                let color = '#a855f7'; // purple default
                if (cx.status === 'فعال') color = '#14b8a6'; // mint
                else if (cx.status === 'نیمه فعال') color = '#eab308'; // gold
                else if (cx.status === 'مسدود') color = '#ef4444'; // rose

                return (
                  <g
                    key={`map-crossing-${cx.id}`}
                    transform={`translate(${cx.x}, ${cx.y})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCrossing(cx);
                    }}
                    onMouseEnter={() => setHoveredNode(cx)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <polygon
                      points={`0,${-8/zoom} ${7/zoom},${5/zoom} ${-7/zoom},${5/zoom}`}
                      fill={color}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={(isSelected ? 2.5 : 1.5) / zoom}
                      className="transition-all transform hover:scale-150 duration-200"
                      filter={isSelected ? 'url(#glow-cyan)' : undefined}
                    />
                    {isPathCrossing && (
                      <circle
                        r={16 / zoom}
                        fill="none"
                        stroke={color}
                        strokeWidth={1 / zoom}
                        className="animate-pulse"
                        opacity={0.5}
                      />
                    )}
                  </g>
                );
              })}
            </g>

          </g>
        </svg>
      ) : (
        /* Satellite Map container */
        <div id="satellite-map-view" className="w-full h-full relative" ref={maplibreContainerRef}>
          {!webGlSupported && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-10">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-3 animate-bounce" />
              <h3 className="text-sm font-bold text-slate-200 mb-1">شتاب‌دهی سخت‌افزاری WebGL غیرفعال است</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
                تین کلاینت یا فریم ایمن محیط شما اجازه ساخت زمینه رندر WebGL به Maplibre را نمی‌دهد. لطفاً از نقشه برداری گرافیکی استفاده نمایید.
              </p>
              <button
                onClick={() => setMapMode('blueprint')}
                className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold rounded-lg transition"
              >
                بازگشت به نقشه برداری
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Hover Tooltip Layer overlay */}
      {hoveredNode && (
        <div
          id="map-hover-tooltip"
          className="absolute bottom-5 right-5 z-20 bg-slate-950/95 border border-slate-800/90 rounded-xl p-3.5 shadow-2xl max-w-xs transition-opacity duration-300 pointer-events-none animate-fade-in"
        >
          <div className="flex items-center gap-2 mb-1.5 border-b border-slate-800/60 pb-1.5">
            <MapPin className={`h-4 w-4 ${hoveredNode.status ? 'text-purple-400' : 'text-teal-400'}`} />
            <div>
              <h4 className="text-xs font-bold text-slate-100">{hoveredNode.name}</h4>
              {hoveredNode.name_en && (
                <span className="text-[10px] text-slate-500 font-mono block -mt-0.5">{hoveredNode.name_en}</span>
              )}
            </div>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 mr-auto">
              {hoveredNode.country}
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400">
            {hoveredNode.status ? (
              <>
                <div className="flex justify-between">
                  <span>وضعیت دروازه:</span>
                  <span className={`font-semibold ${
                    hoveredNode.status === 'فعال' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>{hoveredNode.status}</span>
                </div>
                {hoveredNode.type && (
                  <div className="flex justify-between">
                    <span>نوع گمرک:</span>
                    <span className="text-slate-200">{hoveredNode.type}</span>
                  </div>
                )}
                {hoveredNode.highway && (
                  <div className="flex justify-between">
                    <span>شاهراه متصل:</span>
                    <span className="text-cyan-400 font-mono">{hoveredNode.highway}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-500 text-[10px]">
                نقطه گره تجاری جاده‌ای دایر در مسیرهای کریدور زمینی
              </p>
            )}
          </div>
          <div className="mt-1.5 text-[9px] text-teal-400/80 font-mono text-left">
            Lat: {hoveredNode.lat.toFixed(3)} | Lng: {hoveredNode.lng.toFixed(3)}
          </div>
        </div>
      )}

      {/* Map Interactive Quick Keys */}
      <div id="map-legend" className="absolute bottom-4 left-4 z-10 hidden sm:flex flex-col gap-1.5 bg-slate-950/85 backdrop-blur-md px-3.5 py-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 shadow-xl select-none">
        <span className="text-xs font-bold text-slate-200 border-b border-slate-800/60 pb-1 mb-1">راهنمای نقشه</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-teal-500 border border-teal-300" />
          <span>مبدا / گره ترانزیتی فعال</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-teal-500" />
          <span>پایانه مرز فعال (گمرک)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-amber-500" />
          <span>پایانه نیمه فعال / شلوغ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-5 bg-teal-400 border-b border-cyan-400 shadow-sm" />
          <span>مسیر فعال کریدور</span>
        </div>
      </div>
    </div>
  );
};
