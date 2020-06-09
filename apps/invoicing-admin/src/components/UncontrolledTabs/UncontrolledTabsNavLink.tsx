import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import { NavLink } from 'reactstrap';

import { Consumer } from './context';

const UncontrolledTabsNavLink = props => (
  <Consumer>
    {(value:Value) => (
      <NavLink
        {..._.omit(props, ['tabId'])}
        onClick={() => {
          value.setActiveTabId(props.tabId);
        }}
        className={classNames({ active: props.tabId === value.activeTabId })}
        href='javascript:;'
      />
    )}
  </Consumer>
);
UncontrolledTabsNavLink.propTypes = {
  tabId: PropTypes.string.isRequired
};

interface Value {
  activeTabId: number;
  setActiveTabId(tabId: number): void;
}

export { UncontrolledTabsNavLink };
