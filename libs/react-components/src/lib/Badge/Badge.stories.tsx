import React from 'react';

import Badge from './Badge';

export const Default = () => (
  <div
    style={{alignItems: 'flex-start', display: 'flex', flexDirection: 'column'}}
  >
    <Badge mb={1}>AE</Badge>
    <Badge mb={1}>EA</Badge>
    <Badge mb={1}>CE</Badge>
    <Badge mb={1}>CA</Badge>
    <Badge mb={1}>SA</Badge>
  </div>
);

export const Inverse = () => (
  <div
    style={{alignItems: 'flex-start', display: 'flex', flexDirection: 'column'}}
  >
    <Badge inverse mb={1}>
      AE
    </Badge>
    <Badge inverse mb={1}>
      EA
    </Badge>
    <Badge inverse mb={1}>
      CE
    </Badge>
    <Badge inverse mb={1}>
      CA
    </Badge>
    <Badge inverse mb={1}>
      SA
    </Badge>
  </div>
);

export default {
  component: Badge,
  title: 'Components|Badge'
};
