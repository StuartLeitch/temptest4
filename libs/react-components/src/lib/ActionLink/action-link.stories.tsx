import React from 'react';
import {action} from '@storybook/addon-actions';

import ActionLink from './action-link';

export const Action = () => (
  <React.Fragment>
    <div>
      <ActionLink type="action" onClick={action('click action')}>
        Action
      </ActionLink>
    </div>
  </React.Fragment>
);

export const Link = () => (
  <React.Fragment>
    <div>
      <ActionLink type="link" onClick={action('click link')}>
        Link
      </ActionLink>
    </div>
  </React.Fragment>
);

export default {
  title: 'Components|ActionLink',
  component: ActionLink
};
