import React, {useEffect, useState} from 'react';
import Downshift, {ChildrenFunction, DownshiftProps} from 'downshift';

export interface Props {
  options?: any[];
}

interface State {
  visible: boolean;
}

const Dropdown: React.FunctionComponent<Props> = ({options}) => {
  return (
    <Downshift>
      {({isOpen, toggleMenu}) => {
        return (
          <div>
            salut din downshift!
            <button onClick={() => toggleMenu()}>toggle</button>
            <span>{isOpen ? 'e open' : 'it is closed'}</span>
          </div>
        );
      }}
    </Downshift>
  );
};

export default Dropdown;
