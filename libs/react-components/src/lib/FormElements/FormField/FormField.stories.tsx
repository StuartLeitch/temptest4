import React from 'react';
import {select} from '@storybook/addon-knobs';

import FormField from './FormField';
import Textarea from '../Textarea';

export const Default = () => (
  <div style={{display: 'flex', flexDirection: 'column'}}>
    <FormField
      required
      label="Email"
      error="Something is wrong..."
      id="email-field"
      status={select(
        'Email status',
        ['none', 'success', 'info', 'warning'],
        'none'
      )}
    />
    <FormField
      required
      type="password"
      label="Password"
      id="password-field"
      status={select(
        'Password status',
        ['none', 'success', 'info', 'warning'],
        'none'
      )}
    />
  </div>
);

export const withTextarea = () => (
  <div style={{display: 'flex', flexDirection: 'column'}}>
    <FormField
      component={Textarea}
      required
      label="Email"
      error="Something is wrong..."
      id="email-field"
      status={select(
        'Email status',
        ['none', 'success', 'info', 'warning'],
        'none'
      )}
    />
    <FormField
      required
      label="Password"
      type="password"
      id="password-field"
      status={select(
        'Password status',
        ['none', 'success', 'info', 'warning'],
        'none'
      )}
      width={50}
      component={props => <Textarea {...props} />}
    />
  </div>
);

export default {
  title: 'Form Elements|Form Field',
  component: FormField
};
