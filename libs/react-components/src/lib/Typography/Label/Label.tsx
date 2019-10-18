import React from 'react';
import {SpaceProps} from 'styled-system';

import {Label as Root} from './Label.styles';

export type LabelTypes = 'regular' | 'success' | 'info' | 'warning';

export interface Props extends SpaceProps {
  children?: React.ReactNode;
  type?: LabelTypes;
  required?: boolean;
  htmlFor?: string;
}

const Label: React.FunctionComponent<Props> = ({children, ...rest}) => (
  <Root {...rest}>{children}</Root>
);

export default Label;
