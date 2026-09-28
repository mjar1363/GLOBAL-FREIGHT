import { crossingsPart1 } from './crossings1';
import { crossingsPart2 } from './crossings2';
import { crossingsPart3 } from './crossings3';
import { corridors as corr } from './crossings3';

export const DATA = {
  crossings: [...crossingsPart1, ...crossingsPart2, ...crossingsPart3],
  corridors: corr
};
