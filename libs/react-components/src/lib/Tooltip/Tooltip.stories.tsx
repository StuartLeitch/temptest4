import React from 'react';

import Tooltip from './Tooltip';

export const Bottom = () => (
  <div style={{ padding: '40px', margin: '40px' }}>
    <Tooltip message='blablabla' position='bottom' left='2' top='2'>
      <button>Press Me!</button>
    </Tooltip>
  </div>
);

export const Top = () => (
  <div style={{ padding: '40px', margin: '40px' }}>
    <Tooltip message='blablabla' position='top' left='2' top='2'></Tooltip>
  </div>
);

export const Left = () => (
  <div style={{ padding: '40px', margin: '40px' }}>
    <Tooltip
      message='blablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablabla blablablablablablablablablablablablablablablablablablablablablablablabla blablablablablablablablablablablablablablablablablablablablabla'
      position='left'
      left='2'
      top='2'
    ></Tooltip>

    <Tooltip message='blabla' position='left' left='2' top='10'></Tooltip>
  </div>
);

export const Right = () => (
  <div style={{ padding: '40px', margin: '40px' }}>
    <Tooltip message='blablabla' position='right' left='2' top='2'></Tooltip>
  </div>
);

export default {
  title: 'Components|Tooltip',
  component: Tooltip
};
