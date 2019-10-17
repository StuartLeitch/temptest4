import React from 'react';
import {SpaceProps} from 'styled-system';

import icons from './icons';

import {Icon as Root} from './Icon.styles';

export type IconNames =
  | 'arrowDown'
  | 'arrowUp'
  | 'addUser'
  | 'breadcrumbs'
  | 'calendar'
  | 'caretDown'
  | 'caretLeft'
  | 'caretRight'
  | 'caretUp'
  | 'check'
  | 'checkbox'
  | 'checkboxFilled'
  | 'checkboxIndeterminate'
  | 'checks'
  | 'collapse'
  | 'close'
  | 'dashboard'
  | 'deactivate'
  | 'delete'
  | 'download'
  | 'downloadZip'
  | 'expand'
  | 'info'
  | 'infoFilled'
  | 'edit'
  | 'externalLink'
  | 'impersonate'
  | 'lead'
  | 'leadFilled'
  | 'left'
  | 'leftEnd'
  | 'manuscripts'
  | 'more'
  | 'moreFilled'
  | 'move'
  | 'portfolios'
  | 'preview'
  | 'radioFilled'
  | 'radioUnfilled'
  | 'remove'
  | 'removeFilled'
  | 'reports'
  | 'resend'
  | 'right'
  | 'rightEnd'
  | 'save'
  | 'search'
  | 'settings'
  | 'user'
  | 'tooltip'
  | 'tooltipFilled'
  | 'vendors'
  | 'warning'
  | 'warningFilled';

export interface Props extends SpaceProps {
  color?: string;
  size?: number;
  name: IconNames;
  disabled?: boolean;
  onClick?(e: React.MouseEvent<HTMLElement>): void;
}

const Icon: React.FunctionComponent<Props> = ({name, ...rest}) => (
  <Root
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path fillRule="evenodd" clipRule="evenodd" d={icons[name]} />
  </Root>
);

Icon.defaultProps = {
  size: 4,
  color: 'colors.white',
  disabled: false
};

export default Icon;
