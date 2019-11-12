import React, {Fragment, useEffect, useState} from 'react';
import Downshift, {ChildrenFunction, DownshiftProps} from 'downshift';

import {th} from '../Theme';
import styled from 'styled-components';

export interface Props {
  options?: any[];
}

interface State {
  visible: boolean;
}

const Dropdown: React.FunctionComponent<Props> = ({options}) => {
  return (
    <Downshift>
      {({isOpen, toggleMenu, ...rest}) => {
        return (
          <div>
            <Root />
            <button onClick={() => toggleMenu()}>toggle</button>
            <span>{isOpen ? 'e open' : 'it is closed'}</span>
          </div>
        );
      }}
    </Downshift>
  );
};

export default Dropdown;

Dropdown.defaultProps = {
  options: [
    {
      name: 'Romania',
      value: 'RO'
    },
    {
      name: 'Moldova',
      value: 'MD'
    },
    {
      name: 'United Kingdom',
      value: 'UK'
    },
    {
      name: 'France',
      value: 'FR'
    },
    {
      name: 'Belgium',
      value: 'BE'
    },
    {
      name: 'Germany',
      value: 'GE'
    }
  ]
};

// #region styles
const Root = styled.div`
  background-color: salmon;
  border-radius: ${th('gridUnit')};
`;
// #endregion
