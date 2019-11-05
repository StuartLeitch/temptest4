import './fonts/index.css';
import colors from './colors';
import buttons from './buttons';
import {fontSizes, defaultFont} from './typography';

import {generateSpaces} from './helpers';

const GRID_UNIT = 4;
const theme = {
  colors,
  buttons,
  fontSizes,
  fontFamily: defaultFont,
  gridUnit: `${GRID_UNIT}px`,
  space: generateSpaces(GRID_UNIT),
  sizes: generateSpaces(GRID_UNIT)
};

export * from './helpers';

export default theme;
