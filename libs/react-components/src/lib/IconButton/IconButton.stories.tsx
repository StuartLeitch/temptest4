import React from 'react';

import IconButton from './IconButton';

export const Default = () => (
  <div>
    <IconButton name="leftEnd" mr={2} />
    <IconButton name="left" mr={2} />
    <IconButton name="right" mr={2} />
    <IconButton name="rightEnd" />
  </div>
);

export const Highlighted = () => (
  <div>
    <IconButton highlight name="leftEnd" mr={2} />
    <IconButton highlight name="left" mr={2} />
    <IconButton highlight name="right" mr={2} />
    <IconButton highlight name="rightEnd" />
  </div>
);

export const Disabled = () => (
  <div>
    <IconButton disabled name="leftEnd" mr={2} />
    <IconButton disabled name="left" mr={2} />
    <IconButton disabled name="right" mr={2} />
    <IconButton disabled name="rightEnd" />
  </div>
);

export default {
  title: 'Components|IconButton',
  component: IconButton
};
