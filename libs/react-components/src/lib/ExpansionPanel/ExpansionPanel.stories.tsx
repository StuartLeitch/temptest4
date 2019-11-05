import React, {useState} from 'react';
import {action} from '@storybook/addon-actions';

import ExpansionPanel from './ExpansionPanel';

export const InternalState = () => (
  <React.Fragment>
    <div>
      <ExpansionPanel title="Tellus integer feugiat">
        <div>
          <div>
            <span>Journal Title</span>
            <span>Parkinson's Disease</span>
          </div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </ExpansionPanel>
    </div>
  </React.Fragment>
);

export const ParentState = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <React.Fragment>
      <div>
        <ExpansionPanel
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
            <div>
              <span>Journal Title</span>
              <span>Parkinson's Disease</span>
            </div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </ExpansionPanel>
      </div>
    </React.Fragment>
  );
};

export default {
  title: 'Components|ExpansionPanel',
  component: ExpansionPanel
};
