import { roadNetworkPart1 } from './roadNetworkPart1';
import { roadNetworkPart2 } from './roadNetworkPart2';

export const RN: Record<string, { color: string; routes: any[] }> = {
  ...roadNetworkPart1,
  ...roadNetworkPart2
};
