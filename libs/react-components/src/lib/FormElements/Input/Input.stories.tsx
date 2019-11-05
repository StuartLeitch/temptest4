import React from 'react';
import {select} from '@storybook/addon-knobs';

import Input from './Input';

export const TextInput = () => (
  <Input
    status={select(
      'Input status',
      ['none', 'success', 'info', 'warning'],
      'none'
    )}
    placeholder="Placeholder"
  />
);

export const PasswordInput = () => (
  <Input
    status={select(
      'Input status',
      ['none', 'success', 'info', 'warning'],
      'none'
    )}
    type="password"
    placeholder="Placeholder"
  />
);

export const VariableSizes = () => (
  <div style={{display: 'flex', flexDirection: 'column'}}>
    <Input
      mb={2}
      width={240}
      type="password"
      placeholder="Placeholder"
      status={select(
        'Input 1 status',
        ['none', 'success', 'info', 'warning'],
        'none'
      )}
    />
    <Input
      type="text"
      height={50}
      placeholder="Placeholder"
      status={select(
        'Input 2 status',
        ['none', 'success', 'info', 'warning'],
        'none'
      )}
    />
  </div>
);

export default {
  title: 'Form Elements|Input',
  component: Input
};
