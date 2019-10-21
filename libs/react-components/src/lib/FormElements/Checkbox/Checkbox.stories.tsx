import React from 'react';

import Checkbox from './Checkbox';

export const Default = () => (
  <div
    style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}
  >
    <Checkbox id="ketchup" label="Ketchup" mb={1} />
    <Checkbox id="mayo" label="Mayo" mb={1} />
    <Checkbox id="ranch" label="Ranch" mb={1} />
    <Checkbox id="bbq" label="Barbeque" mb={1} />
  </div>
);

export default {
  title: 'Form Elements|Checkbox',
  component: Checkbox
};
