import React from 'react';
import {select} from '@storybook/addon-knobs';

import Flex from './Flex';

export const DefaultFlex = () => <Flex>hello!</Flex>;

export const JustifyChanged = () => (
  <React.Fragment>
    <Flex
      justifyContent={select(
        'Align items',
        ['flex-start', 'flex-end', 'center', 'space-around', 'space-between'],
        'flex-start'
      )}
    >
      <div>Change</div>
      <div>justifyContent</div>
    </Flex>
  </React.Fragment>
);

export const AlignChanged = () => (
  <React.Fragment>
    <Flex
      alignItems={select(
        'Align items',
        ['flex-start', 'flex-end', 'center'],
        'flex-start'
      )}
      height="300px"
    >
      Change alignment!
    </Flex>
  </React.Fragment>
);

export const Direction = () => (
  <React.Fragment>
    <Flex
      flexDirection={select(
        'Flex direction',
        ['row', 'column', 'row-reverse', 'column-reverse'],
        'row'
      )}
    >
      <div>First!</div>
      <div>Second!</div>
    </Flex>
  </React.Fragment>
);

export default {
  title: 'Flex',
  component: Flex
};
