import * as React from 'react';
import {action} from '@storybook/addon-actions';
import {select} from '@storybook/addon-knobs';

import Button from './Button';
import Icon from '../Icon';

export const Primary = () => (
  <Button
    type="primary"
    size={select('Button size', ['large', 'medium', 'small'], 'large')}
    onClick={action('Primary button clicked')}
  >
    <Icon name="breadcrumbs" mr={1} size={4} />
    Primary Button
  </Button>
);

export const Secondary = () => (
  <Button type="secondary" onClick={action('Secondary button clicked')}>
    Secondary Button Longer
    <Icon name="addUser" ml={1} color="colors.primary.info" />
  </Button>
);

export const Outline = () => (
  <Button type="outline" onClick={action('Outline button clicked')}>
    Outline Button
    <Icon name="leftEnd" color="pink" />
  </Button>
);

export default {
  title: 'Button',
  component: Button
};
