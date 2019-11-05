import React from 'react';

import Radio from './Radio';

export const Default = () => (
  <div
    style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}
  >
    <Radio name="make" label="Audi" id="audi" mb={1} />
    <Radio name="make" label="Mercedes" id="mercedes" mb={1} />
    <Radio name="make" label="Lexus" id="lexus" mb={1} />
    <Radio name="make" label="Tesla" id="tesla" mb={1} />
  </div>
);

export default {
  title: 'Form Elements|Radio',
  component: Radio
};
