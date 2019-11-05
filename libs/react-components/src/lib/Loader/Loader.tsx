import React from 'react';
import {SpaceProps} from 'styled-system';

import {Loader as Root} from './Loader.styles';

export interface Props extends SpaceProps {
  size?: number;
}

const Loader: React.FunctionComponent<Props> = (props: Props) => (
  <Root aria-label="loader" {...props} />
);

Loader.defaultProps = {
  size: 3
};

export default Loader;
