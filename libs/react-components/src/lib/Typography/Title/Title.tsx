import React from 'react';
import {SpaceProps, TypographyProps} from 'styled-system';

import {Headings, Titles, Color} from './TitleTypes';

import {Title as Root} from './Title.styles';

export interface Props extends SpaceProps, TypographyProps {
  as?: Headings;
  children?: React.ReactNode;
  upper?: boolean;
  ellipsis?: boolean;
  type?: Titles;
  color?: Color;
}

const Title: React.FunctionComponent<Props> = ({children, ...rest}) => {
  return <Root {...rest}>{children}</Root>;
};

Title.defaultProps = {
  as: 'h1',
  upper: false,
  type: 'primary',
  color: 'light'
};

export default Title;
