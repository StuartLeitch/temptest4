import React from 'react';

import Dropdown from './Dropdown';

const options = ['aurel', 'dorel', 'fanel', 'gigel'];

export const Default = () => <Dropdown options={options} />;

export default {
  title: 'Components|Dropdown',
  component: Dropdown
};
