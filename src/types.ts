export interface Crossing {
  id: number;
  name: string;
  name_en?: string | null;
  country: string;
  type: string;
  status: string;
  lat: number;
  lng: number;
  layer: "road" | "combined" | "rail";
  trucks?: string | null;
  wagons?: string | null;
  warehouse?: string | null;
  cold?: string | null;
  hours_summer?: string | null;
  clearance?: string | null;
  services?: string | null;
  highway?: string | null;
  volume?: string | null;
  cargo?: string | null;
  xg_id?: string | null;
  depth?: string | null;
  corridor?: string | null;
  confidence?: "بالا" | "متوسط" | "پایین" | null;
  src_type?: string | null;
  note?: string | null;
  opp_name?: string | null;
  rail_note?: string | null;
  trucks_est?: number | null;
  clear_est?: number | null;
  x?: [string, string][];
}

export interface Corridor {
  name: string;
  color: string;
  points: [number, number][];
}

export interface RouteStop {
  n: string;
  country: string;
  lat: number;
  lng: number;
  routes: string[];
}

export interface RoadRoute {
  ref: string;
  n: string;
  c: [string, number, number][];
}

export interface CountryRoad {
  color: string;
  routes: RoadRoute[];
}

export interface PathfinderTotalMetrics {
  km: number;
  driveH: number;
  borderH: number;
  tot: number;
  days: number;
  borders: number;
  gates: any[];
  cities: number;
}

export interface PathfinderLeg {
  ref: string;
  kind: "road" | "link";
  color: string;
  gate: any | null;
  from: string;
  to: string;
  km: number;
  h: number;
  cities: string[];
}
