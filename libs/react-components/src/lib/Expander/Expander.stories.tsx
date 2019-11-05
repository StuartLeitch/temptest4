import React, {useState} from 'react';
import {action} from '@storybook/addon-actions';

import Expander from './Expander';

export const InternalState = () => (
  <Expander title="Tellus integer feugiat">
    <div>
      <span>Journal Title</span>
      <span>Parkinson's Disease</span>
    </div>
  </Expander>
);

export const ParentState = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Expander
      title="Tellus integer feugiat"
      expanded={expanded}
      onClick={() => {
        setExpanded(!expanded);
        if (!expanded) {
          action('expanded')(null);
        } else {
          action('collapsed')(null);
        }
      }}
    >
      <div>
        <span>Journal Title</span>
        <span>Parkinson's Disease</span>
      </div>
    </Expander>
  );
};

export default {
  title: 'Components|Expander',
  component: Expander
};
