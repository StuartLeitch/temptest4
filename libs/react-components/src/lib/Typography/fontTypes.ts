import {css} from 'styled-components';
import {th} from '../Theme';

export const regular = () => css`
  font-family: ${th('fontFamily')};
  font-weight: normal;
  font-style: normal;
`;

export const regularItalic = () => css`
  font-family: ${th('fontFamily')};
  font-weight: normal;
  font-style: italic;
`;

export const semibold = () => css`
  font-family: ${th('fontFamily')};
  font-weight: 600;
  font-style: normal;
`;

export const semiboldItalic = () => css`
  font-family: ${th('fontFamily')};
  font-weight: 600;
  font-style: italic;
`;

export const bold = () => css`
  font-family: ${th('fontFamily')};
  font-weight: 600;
  font-style: normal;
`;

export const boldItalic = () => css`
  font-family: ${th('fontFamily')};
  font-weight: 700;
  font-style: italic;
`;
