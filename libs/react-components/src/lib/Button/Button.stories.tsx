import * as React from 'react';
import {action} from '@storybook/addon-actions';
import {select, boolean} from '@storybook/addon-knobs';

import Button from './Button';
import Icon from '../Icon';

export const Primary = () => (
  <React.Fragment>
    <Button
      mb={4}
      size="large"
      type="primary"
      loading={boolean('Loading', false)}
      onClick={action('Primary button clicked')}
    >
      Primary Button
    </Button>
    <Button
      mb={4}
      size="large"
      type="primary"
      loading={boolean('Loading', false)}
      onClick={action('Primary button clicked')}
    >
      Primary Button with Icon
      <Icon name="dashboard" ml={1} size={4} />
    </Button>
    <Button
      mb={4}
      size="large"
      type="primary"
      loading={boolean('Loading', false)}
      onClick={action('Primary button clicked')}
    >
      <Icon name="downloadZip" mr={1} size={4} color="cyan" />
      Primary with Icon on the left
    </Button>
    <Button
      mb={4}
      size="medium"
      type="primary"
      loading={boolean('Loading', false)}
      onClick={action('Primary button clicked')}
    >
      Medium primary
    </Button>
    <Button
      mb={4}
      size="small"
      type="primary"
      loading={boolean('Loading', false)}
      onClick={action('Primary button clicked')}
    >
      Small
    </Button>
  </React.Fragment>
);

export const Secondary = () => (
  <React.Fragment>
    <Button
      type="secondary"
      loading={boolean('Loading', false)}
      onClick={action('Secondary button clicked')}
      size="large"
      mb={4}
    >
      Secondary Large
    </Button>
    <Button
      mb={4}
      type="secondary"
      loading={boolean('Loading', false)}
      onClick={action('Secondary button clicked')}
      size="large"
    >
      Secondary Large with Icon
      <Icon ml={2} name="warning" />
    </Button>
    <Button
      mb={4}
      size="large"
      type="secondary"
      loading={boolean('Loading', false)}
      onClick={action('Secondary button clicked')}
    >
      <Icon mr={2} name="warning" />
      Icon on the left
    </Button>
    <Button
      type="secondary"
      loading={boolean('Loading', false)}
      onClick={action('Secondary button clicked')}
      size="medium"
      mb={4}
    >
      Secondary
    </Button>
    <Button
      type="secondary"
      loading={boolean('Loading', false)}
      onClick={action('Secondary button clicked')}
      size="small"
    >
      Sec
    </Button>
  </React.Fragment>
);

export const Outline = () => (
  <React.Fragment>
    <Button
      mb={4}
      size="large"
      type="outline"
      loading={boolean('Loading', false)}
      onClick={action('Primary button clicked')}
    >
      Outline Button
    </Button>
    <Button
      mb={4}
      size="large"
      type="outline"
      loading={boolean('Loading', false)}
      onClick={action('Primary button clicked')}
    >
      Outline Button with Icon
      <Icon name="dashboard" ml={1} size={4} color="black" />
    </Button>
    <Button
      mb={4}
      size="large"
      type="outline"
      loading={boolean('Loading', false)}
      onClick={action('Primary button clicked')}
    >
      <Icon name="downloadZip" mr={1} size={4} color="cyan" />
      Outline with Icon on the left
    </Button>
    <Button
      mb={4}
      size="medium"
      type="outline"
      loading={boolean('Loading', false)}
      onClick={action('Primary button clicked')}
    >
      Medium Outline
    </Button>
    <Button
      mb={4}
      size="small"
      type="outline"
      loading={boolean('Loading', false)}
      onClick={action('Primary button clicked')}
    >
      Small
    </Button>
  </React.Fragment>
);

export const Disabled = () => (
  <React.Fragment>
    <Button
      mb={4}
      disabled
      type="outline"
      onClick={action('Disabled button clicked')}
      loading={boolean('Loading', false)}
    >
      Disabled Button
      <Icon name="leftEnd" color="black" />
    </Button>
    <Button
      mb={4}
      disabled
      size="medium"
      type="outline"
      onClick={action('Disabled button clicked')}
      loading={boolean('Loading', false)}
    >
      Medium Disabled
    </Button>
    <Button
      mb={4}
      disabled
      size="medium"
      type="outline"
      onClick={action('Disabled button clicked')}
      loading={boolean('Loading', false)}
    >
      Small
    </Button>
  </React.Fragment>
);

export default {
  title: 'Button',
  component: Button
};
