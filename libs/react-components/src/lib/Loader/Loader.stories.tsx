import * as React from 'react';
import {number} from '@storybook/addon-knobs';

import Loader from './Loader';

export const Default = () => <Loader size={number('Size', 4)} />;

export default {
  title: 'Loader',
  component: Loader
};
