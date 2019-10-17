import React from 'react';
import {select, color, number} from '@storybook/addon-knobs';

import Icon, {IconNames} from './Icon';

const iconNames = [
  'arrowDown',
  'arrowUp',
  'addUser',
  'breadcrumbs',
  'calendar',
  'caretDown',
  'caretLeft',
  'caretRight',
  'caretUp',
  'check',
  'checkbox',
  'checkboxFilled',
  'checkboxIndeterminate',
  'checks',
  'collapse',
  'close',
  'dashboard',
  'deactivate',
  'delete',
  'download',
  'downloadZip',
  'expand',
  'info',
  'infoFilled',
  'edit',
  'externalLink',
  'impersonate',
  'lead',
  'leadFilled',
  'left',
  'leftEnd',
  'manuscripts',
  'more',
  'moreFilled',
  'move',
  'portfolios',
  'preview',
  'radioFilled',
  'radioUnfilled',
  'remove',
  'removeFilled',
  'reports',
  'resend',
  'right',
  'rightEnd',
  'save',
  'search',
  'settings',
  'user',
  'tooltip',
  'tooltipFilled',
  'vendors',
  'warning',
  'warningFilled'
];

export const Default = () => (
  <Icon
    name={select('Icon name', iconNames, 'tooltip') as IconNames}
    size={number('Size', 8)}
    color={color('Color', '#3399FF')}
  />
);

export default {
  title: 'Icon',
  component: Icon
};
