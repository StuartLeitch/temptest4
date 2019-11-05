import React from 'react';
import {boolean, select} from '@storybook/addon-knobs';

import Label from './Label';

export const Default = () => (
  <Label
    mb={4}
    type={select(
      'Label type',
      ['regular', 'success', 'info', 'warning'],
      'regular'
    )}
    required={boolean('Required', false)}
  >
    First name
  </Label>
);

export const InputLabel = () => (
  <div style={{display: 'flex', flexDirection: 'column', width: 150}}>
    <Label
      htmlFor="test-input"
      type={select(
        'Label type',
        ['regular', 'success', 'info', 'warning'],
        'regular'
      )}
      required={boolean('Required', false)}
    >
      Email
    </Label>
    <input id="test-input" placeholder="email..." />
  </div>
);

export default {
  title: 'Typography|Label',
  component: Label
};
