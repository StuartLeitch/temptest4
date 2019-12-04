import React from 'react';

import Tooltip from './Tooltip';

export const Default = () => (
  <div style={{ padding: '40px', margin: '40px' }}>
    <Tooltip message='blablabla' left='2' top='2'></Tooltip>
  </div>
);

export default {
  title: 'Components|Tooltip',
  component: Tooltip
};
