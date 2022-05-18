import React from 'react';
import { SpaceProps, PositionProps } from 'styled-system';

import icons from './icons';

import type { IconNames } from './Icon.types';
import { Icon as Root } from './Icon.styles';

export interface Props extends SpaceProps, PositionProps {
  color?: string;
  size?: number;
  name: IconNames;
  disabled?: boolean;
  onClick?(e: React.MouseEvent<HTMLElement>): void;
}

const Icon: React.FunctionComponent<Props> = ({ name, ...rest }) => {
  const path = icons[name];

  return (
    <Root
      viewBox='0 0 32 32'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...rest}
    >
      {Array.isArray(path) ? (
        path.map((p) => (
          <path key={p} fillRule='evenodd' clipRule='evenodd' d={p} />
        ))
      ) : (
        <path fillRule='evenodd' clipRule='evenodd' d={path} />
      )}
    </Root>
  );
};

Icon.defaultProps = {
  size: 4,
  color: 'colors.white',
  disabled: false,
};

export default Icon;
