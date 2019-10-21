import React from 'react';
import {SpaceProps, TypographyProps} from 'styled-system';

import {Text as Root} from './Text.styles';

export type TextTypes =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info';

export type TextSizes = 'small' | 'normal';

export interface Props extends SpaceProps, TypographyProps {
  children?: React.ReactNode;
  as?: 'span' | 'p';
  type?: TextTypes;
  size?: TextSizes;
}

const Text: React.FunctionComponent<Props> = ({children, ...rest}) => (
  <Root {...rest}>{children}</Root>
);

Text.defaultProps = {
  as: 'span',
  type: 'primary',
  size: 'normal'
};

export default Text;
