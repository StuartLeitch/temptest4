import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';

import { withPageConfig } from '../Layout';
import { SidebarContent } from './SidebarContent';

const Sidebar: React.FC<SidebarProps> = (props) => (
  <SidebarContent {...props} />
);

Sidebar.propTypes = {
  children: PropTypes.node,
  slim: PropTypes.bool,
  collapsed: PropTypes.bool,
  animationsDisabled: PropTypes.bool,
  pageConfig: PropTypes.object,
};

interface SidebarProps {
  children: ReactNode;
  slim?: boolean;
  collapsed?: boolean;
  animationsDisabled?: boolean;
  pageConfig?: any;
}

const cfgSidebar = withPageConfig(Sidebar);

export { cfgSidebar as Sidebar };
