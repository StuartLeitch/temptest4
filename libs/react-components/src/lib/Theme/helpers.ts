import {get} from 'lodash';
import Color from 'color';

export type Theme = {
  colors: {
    primary: {
      action: string;
      text: string;
      info: string;
      warning: string;
    };
    seconday: {
      action: string;
      text: string;
      title: string;
    };
    approved: string;
    background: string;
    furniture: string;
    disabled: string;
  };
  gridUnit: string;
  sizes: [number];
};

/**
 *
 * @param gridUnit
 * Generate an array of values used by styled-system functions.
 */
const generateSpaces = (gridUnit: number = 4): number[] => {
  return Array.from({length: 100}, (_, index) => index * gridUnit);
};

const th = (themePath: string) => ({
  theme
}: {
  theme: Theme;
}): string | number => {
  return get(theme, themePath, themePath);
};

const normalizePercent = (num: number) =>
  num >= 1 && num <= 100 ? num / 100 : num;

const darkenLighten = (
  original: string,
  percent: number,
  theme: Theme,
  dark?: boolean
) => {
  const color = get(theme, original) || original;
  const thisMuch = normalizePercent(percent);

  let converted: Color;
  try {
    converted = Color(color);
  } catch (_) {
    converted = Color('black');
  }

  if (dark) return converted.darken(thisMuch).string();
  return converted.lighten(thisMuch).string();
};

const darken = (original: string, percent: number) => ({
  theme
}: {
  theme: Theme;
}) => darkenLighten(original, percent, theme, true);

const lighten = (original: string, percent: number) => ({
  theme
}: {
  theme: Theme;
}) => darkenLighten(original, percent, theme);

export {darken, lighten, th, generateSpaces};
