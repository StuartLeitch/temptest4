import React from 'react';
import {select} from '@storybook/addon-knobs';

import Text from './Text';

export const Default = () => (
  <Text
    type={select(
      'Text type',
      ['primary', 'secondary', 'success', 'warning', 'info'],
      'primary'
    )}
  >
    The quick brown fox jumps over the lazy dog
  </Text>
);

export const Small = () => (
  <Text
    size="small"
    type={select(
      'Text type',
      ['primary', 'secondary', 'success', 'warning', 'info'],
      'primary'
    )}
  >
    The quick brown fox jumps over the lazy dog
  </Text>
);

export default {
  title: 'Typography|Text',
  component: Text
};
