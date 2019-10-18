import React from 'react';
import {SpaceProps, TypographyProps} from 'styled-system';

import {Title as Root} from './Title.styles';

export type Headings = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type Titles = 'hero' | 'primary' | 'small';

export interface Props extends SpaceProps, TypographyProps {
  as?: Headings;
  children?: React.ReactNode;
  upper?: boolean;
  ellipsis?: boolean;
  type?: Titles;
}

const Title: React.FunctionComponent<Props> = ({children, ...rest}) => {
  return <Root {...rest}>{children}</Root>;
};

Title.defaultProps = {
  as: 'h1',
  upper: false,
  type: 'primary'
};

export default Title;
