import colors from './colors';
import buttons from './buttons';

import {generateSpaces} from './helpers';

const GRID_UNIT = 4;
const theme = {
  colors,
  buttons,
  gridUnit: `${GRID_UNIT}px`,
  space: generateSpaces(GRID_UNIT)
};

export * from './helpers';
export default theme;
