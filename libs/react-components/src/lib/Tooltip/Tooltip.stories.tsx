import React from 'react';

import Tooltip from './Tooltip';

export const Bottom = () => (
  <div style={{ padding: '40px', margin: '40px' }}>
    <Tooltip message='blablabla' direction='bottom' left='2' top='2'></Tooltip>
  </div>
);

export const Top = () => (
  <div style={{ padding: '40px', margin: '40px' }}>
    <Tooltip message='blablabla' direction='top' left='2' top='2'></Tooltip>
  </div>
);

export const Left = () => (
  <div style={{ padding: '40px', margin: '40px' }}>
    <Tooltip
      message='blablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablabla blablablablablablablablablablablablablablablablablablablablablablablabla blablablablablablablablablablablablablablablablablablablablabla'
      direction='left'
      left='2'
      top='2'
    ></Tooltip>

    <Tooltip message='blabla' direction='left' left='2' top='10'></Tooltip>
  </div>
);

export const Right = () => (
  <div style={{ padding: '40px', margin: '40px' }}>
    <Tooltip message='blablabla' direction='right' left='2' top='2'></Tooltip>
  </div>
);

export default {
  title: 'Components|Tooltip',
  component: Tooltip
};
