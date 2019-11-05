import * as React from 'react';
import {action} from '@storybook/addon-actions';
import {boolean} from '@storybook/addon-knobs';

import Button from './Button';
import Icon from '../Icon';

export const Primary = () => (
  <React.Fragment>
    <div>
      <Button
        mb={4}
        size="large"
        type="primary"
        loading={boolean('Loading', false)}
        onClick={action('Primary button clicked')}
      >
        Primary Button
      </Button>
    </div>
    <div>
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
    </div>
    <div>
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
    </div>
    <div>
      <Button
        mb={4}
        size="medium"
        type="primary"
        loading={boolean('Loading', false)}
        onClick={action('Primary button clicked')}
      >
        Medium primary
      </Button>
    </div>
    <div>
      <Button
        mb={4}
        size="small"
        type="primary"
        loading={boolean('Loading', false)}
        onClick={action('Primary button clicked')}
      >
        Small
      </Button>
    </div>
  </React.Fragment>
);

export const Secondary = () => (
  <React.Fragment>
    <div>
      <Button
        type="secondary"
        loading={boolean('Loading', false)}
        onClick={action('Secondary button clicked')}
        size="large"
        mb={4}
      >
        Secondary Large
      </Button>
    </div>
    <div>
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
    </div>
    <div>
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
    </div>
    <div>
      <Button
        type="secondary"
        loading={boolean('Loading', false)}
        onClick={action('Secondary button clicked')}
        size="medium"
        mb={4}
      >
        Secondary
      </Button>
    </div>
    <div>
      <Button
        type="secondary"
        loading={boolean('Loading', false)}
        onClick={action('Secondary button clicked')}
        size="small"
      >
        Sec
      </Button>
    </div>
  </React.Fragment>
);

export const Outline = () => (
  <React.Fragment>
    <div>
      <Button
        mb={4}
        size="large"
        type="outline"
        loading={boolean('Loading', false)}
        onClick={action('Primary button clicked')}
      >
        Outline Button
      </Button>
    </div>
    <div>
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
    </div>
    <div>
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
    </div>
    <div>
      <Button
        mb={4}
        size="medium"
        type="outline"
        loading={boolean('Loading', false)}
        onClick={action('Primary button clicked')}
      >
        Medium Outline
      </Button>
    </div>
    <div>
      <Button
        mb={4}
        size="small"
        type="outline"
        loading={boolean('Loading', false)}
        onClick={action('Primary button clicked')}
      >
        Small
      </Button>
    </div>
  </React.Fragment>
);

export const Disabled = () => (
  <React.Fragment>
    <div>
      <Button
        mb={4}
        disabled
        type="outline"
        onClick={action('Disabled button clicked')}
        loading={boolean('Loading', false)}
      >
        Disabled Button
        <Icon name="leftEnd" color="red" />
      </Button>
    </div>
    <div>
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
    </div>
    <div>
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
    </div>
  </React.Fragment>
);

export default {
  title: 'Components|Button',
  component: Button
};
