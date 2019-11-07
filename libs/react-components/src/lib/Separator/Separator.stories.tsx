import React from 'react';

import Separator from './Separator';

const style = {
  padding: '20px',
  height: '30px',
  width: '30px',
  background: 'white'
};

export const Vertical = () => (
  <div style={style}>
    <Separator direction="vertical"></Separator>
  </div>
);

export const Horizontal = () => (
  <div style={style}>
    <Separator direction="horizontal"></Separator>
  </div>
);

export default {
  title: 'Components|Separator',
  component: Separator
};
