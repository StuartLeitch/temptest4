import React, {Fragment} from 'react';
import {action} from '@storybook/addon-actions';

import Icon from '../Icon';
import TextButton from './TextButton';

export const Default = () => (
  <TextButton onClick={action('Text button clicked')}>
    Primary text button
  </TextButton>
);

export const Disabled = () => (
  <TextButton disabled onClick={action('Text button clicked')}>
    Disabled button
  </TextButton>
);

export const WithIcon = () => (
  <Fragment>
    <TextButton onClick={action('Text button clicked')} mb={2}>
      <Icon name="addUser" mr={1} />
      Add user
    </TextButton>
    <TextButton onClick={action('Text button clicked')} mb={2}>
      Go to dashboard
      <Icon name="calendar" ml={1} />
    </TextButton>
  </Fragment>
);

export const WithIconDisabled = () => (
  <Fragment>
    <TextButton disabled onClick={action('Text button clicked')} mb={2}>
      <Icon name="addUser" mr={1} />
      Add user
    </TextButton>
    <TextButton disabled onClick={action('Text button clicked')} mb={2}>
      Go to dashboard
      <Icon name="calendar" ml={1} />
    </TextButton>
  </Fragment>
);

export default {
  title: 'TextButton',
  component: TextButton
};
