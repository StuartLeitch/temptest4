import React from 'react';
import { TabContent } from 'reactstrap';

import { Consumer } from './context';

const UncontrolledTabsTabContent = props => (
  <Consumer>
    {(value: Value) => <TabContent {...props} activeTab={value.activeTabId} />}
  </Consumer>
);

interface Value {
  activeTabId: number;
}

export { UncontrolledTabsTabContent };
