import React from 'react';
import PropTypes from 'prop-types';

import { Provider } from './context';

class UncontrolledTabs extends React.Component<{initialActiveTabId: string}, {activeTabId: string}> {
  static propTypes = {
    children: PropTypes.node.isRequired,
    initialActiveTabId: PropTypes.string
  };
  static NavLink: any;
  static TabContent: any;

  constructor(props) {
    super(props);

    this.state = {
      activeTabId: this.props.initialActiveTabId || null
    };
  }

  render() {
    return (
      <Provider
        value={{
          setActiveTabId: tabId => {
            this.setState({ activeTabId: tabId });
          },
          activeTabId: this.state.activeTabId
        }}
      >
        {this.props.children}
      </Provider>
    );
  }
}

export { UncontrolledTabs };
