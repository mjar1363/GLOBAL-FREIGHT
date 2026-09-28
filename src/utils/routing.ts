import { RN } from '../data/roadNetwork';
import { DATA } from '../data/crossings';
import { Crossing } from '../types';

export interface GraphNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number; // distance in km
  ref: string; // route name / ID (e.g., "جاده ۴۴")
  kind: 'road' | 'border';
  country: string;
  crossing?: Crossing;
}

// Haversine formula for physical distances
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface RoutingGraph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge[]>;
}

export function buildGraph(): RoutingGraph {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge[]>();

  const addNode = (name: string, lat: number, lng: number, country: string) => {
    const id = `${name} (${country})`;
    if (!nodes.has(id)) {
      nodes.set(id, { id, name, lat, lng, country });
    }
    return id;
  };

  const addEdge = (edge: GraphEdge) => {
    if (!edges.has(edge.from)) {
      edges.set(edge.from, []);
    }
    edges.get(edge.from)!.push(edge);

    // Also add reverse direction since roads/borders are bidirectional
    const reverseEdge: GraphEdge = {
      from: edge.to,
      to: edge.from,
      weight: edge.weight,
      ref: edge.ref,
      kind: edge.kind,
      country: edge.country,
      crossing: edge.crossing
    };
    if (!edges.has(reverseEdge.from)) {
      edges.set(reverseEdge.from, []);
    }
    edges.get(reverseEdge.from)!.push(reverseEdge);
  };

  // 1. Process all road networks of each country
  for (const [countryName, countryData] of Object.entries(RN)) {
    for (const r of countryData.routes) {
      if (!r.c || r.c.length === 0) continue;

      let prevId: string | null = null;
      for (let i = 0; i < r.c.length; i++) {
        const [stopName, lat, lng] = r.c[i];
        const currentId = addNode(stopName, lat, lng, countryName);

        if (prevId !== null) {
          const prevNode = nodes.get(prevId)!;
          const dist = haversineDistance(prevNode.lat, prevNode.lng, lat, lng);
          addEdge({
            from: prevId,
            to: currentId,
            weight: dist,
            ref: r.ref,
            kind: 'road',
            country: countryName
          });
        }
        prevId = currentId;
      }
    }
  }

  // 2. Identify and connect border nodes (adjacent country nodes within 30km)
  const nodeArray = Array.from(nodes.values());
  const borderThresholdKm = 30;

  for (let i = 0; i < nodeArray.length; i++) {
    const nodeA = nodeArray[i];
    for (let j = i + 1; j < nodeArray.length; j++) {
      const nodeB = nodeArray[j];
      if (nodeA.country === nodeB.country) continue;

      const dist = haversineDistance(nodeA.lat, nodeA.lng, nodeB.lat, nodeB.lng);
      if (dist <= borderThresholdKm) {
        // Find if there is a crossing point nearby
        const crossingsList = (DATA.crossings || []) as Crossing[];
        let bestCrossing: Crossing | undefined = undefined;
        let minCrossingDist = 45; // limit crossing matching to 45km

        for (const cx of crossingsList) {
          const distToA = haversineDistance(cx.lat, cx.lng, nodeA.lat, nodeA.lng);
          const distToB = haversineDistance(cx.lat, cx.lng, nodeB.lat, nodeB.lng);
          const avgDist = (distToA + distToB) / 2;
          if (avgDist < minCrossingDist) {
            minCrossingDist = avgDist;
            bestCrossing = cx;
          }
        }

        // Add border edge linking these countries
        addEdge({
          from: nodeA.id,
          to: nodeB.id,
          weight: dist,
          ref: bestCrossing ? `مرز ${bestCrossing.name}` : `اتصال مرزی ${nodeA.name} / ${nodeB.name}`,
          kind: 'border',
          country: `${nodeA.country}-${nodeB.country}`,
          crossing: bestCrossing
        });
      }
    }
  }

  return { nodes, edges };
}

export interface PathStep {
  from: GraphNode;
  to: GraphNode;
  weight: number;
  ref: string;
  kind: 'road' | 'border';
  crossing?: Crossing;
}

export interface PathResult {
  path: string[];
  steps: PathStep[];
  totalDistanceKm: number;
  totalDriveHours: number;
  totalBorderHours: number;
  borderCrossingsCount: number;
  bordersList: Crossing[];
}

export function findShortestPath(
  graph: RoutingGraph,
  startNodeId: string,
  endNodeId: string
): PathResult | null {
  if (!graph.nodes.has(startNodeId) || !graph.nodes.has(endNodeId)) {
    return null;
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, { prevId: string; edge: GraphEdge }>();
  const visited = new Set<string>();

  for (const nodeId of graph.nodes.keys()) {
    distances.set(nodeId, Infinity);
  }
  distances.set(startNodeId, 0);

  const getLowestUnvisited = (): string | null => {
    let minDistance = Infinity;
    let lowestNodeId: string | null = null;
    for (const [nodeId, dist] of distances.entries()) {
      if (!visited.has(nodeId) && dist < minDistance) {
        minDistance = dist;
        lowestNodeId = nodeId;
      }
    }
    return lowestNodeId;
  };

  let currentNodeId = getLowestUnvisited();

  while (currentNodeId !== null) {
    if (currentNodeId === endNodeId) break;

    visited.add(currentNodeId);
    const currentDist = distances.get(currentNodeId)!;
    const neighbors = graph.edges.get(currentNodeId) || [];

    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      // Calculate path cost: distance + potential border delay
      // For border crossing edges, we can add a virtual weight penalty to prefer routes with fewer border crossings
      // e.g., 100km virtual penalty for each border, but we keep actual weight calculation separate
      let travelCost = edge.weight;
      if (edge.kind === 'border') {
        travelCost += 150; // border penalty in distance equivalent so router minimizes border hopping
      }

      const alt = currentDist + travelCost;
      if (alt < distances.get(edge.to)!) {
        distances.set(edge.to, alt);
        previous.set(edge.to, { prevId: currentNodeId, edge });
      }
    }

    currentNodeId = getLowestUnvisited();
  }

  if (distances.get(endNodeId) === Infinity) {
    return null; // Path not found
  }

  // Reconstruction
  const path: string[] = [];
  const steps: PathStep[] = [];
  let u = endNodeId;

  while (previous.has(u)) {
    const { prevId, edge } = previous.get(u)!;
    const fromNode = graph.nodes.get(prevId)!;
    const toNode = graph.nodes.get(u)!;

    path.unshift(u);
    steps.unshift({
      from: fromNode,
      to: toNode,
      weight: edge.weight,
      ref: edge.ref,
      kind: edge.kind,
      crossing: edge.crossing
    });
    u = prevId;
  }
  if (path.length > 0) {
    path.unshift(startNodeId);
  } else {
    // Already at destination
    return {
      path: [startNodeId],
      steps: [],
      totalDistanceKm: 0,
      totalDriveHours: 0,
      totalBorderHours: 0,
      borderCrossingsCount: 0,
      bordersList: []
    };
  }

  // Totals calculations
  let totalDistanceKm = 0;
  let totalDriveHours = 0;
  let totalBorderHours = 0;
  const bordersList: Crossing[] = [];

  for (const step of steps) {
    totalDistanceKm += step.weight;
    if (step.kind === 'road') {
      // average highway truck speed: 70 km/h
      totalDriveHours += step.weight / 70;
    } else {
      // Border crossing connection typical transit delay (between 4 to 24 hours)
      const delay = step.crossing?.clear_est ? step.crossing.clear_est : 8;
      totalBorderHours += delay;
      if (step.crossing) {
        // Dedup border crossings in list
        if (!bordersList.some((b) => b.id === step.crossing!.id)) {
          bordersList.push(step.crossing);
        }
      }
    }
  }

  return {
    path,
    steps,
    totalDistanceKm: Math.round(totalDistanceKm),
    totalDriveHours: Math.round(totalDriveHours * 10) / 10,
    totalBorderHours: Math.round(totalBorderHours),
    borderCrossingsCount: bordersList.length,
    bordersList
  };
}
