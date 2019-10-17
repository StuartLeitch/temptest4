import React from 'react';
import styled, {css} from 'styled-components';
import {space, SpaceProps} from 'styled-system';

import icons from './icons';
import {th} from '../Theme';

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
  color: 'colors.white'
};

export default Icon;

// #region styles
const iconSize = ({size}: {size: number}) => css`
  width: calc(${th('gridUnit')} * ${size});
  height: calc(${th('gridUnit')} * ${size});
`;

const Root = styled.svg`
  & path {
    fill: ${({color}: {color: string}) => th(color)};
  }

  ${iconSize};
  ${space};
`;
// #endregion
