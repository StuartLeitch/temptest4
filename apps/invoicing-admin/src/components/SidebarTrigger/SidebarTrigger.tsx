import React from 'react';
import { NavLink } from 'reactstrap';
import PropTypes from 'prop-types';
import { withPageConfig } from '../Layout';

import { UncontrolledTooltip } from 'reactstrap';

const SidebarTrigger = props => {
  const { tag: Tag, pageConfig, ...otherProps } = props;

  return (
    <React.Fragment>
      <Tag
        onClick={() => {
          props.pageConfig.toggleSidebar();
          return false;
        }}
        active={Tag !== 'a' ? !pageConfig.sidebarCollapsed : undefined}
        {...otherProps}
      >
        {props.children}
      </Tag>
      <UncontrolledTooltip placement='right' target={props.id}>
        {!pageConfig.sidebarCollapsed ? 'Collapse sidebar' : 'Expand sidebar'}
      </UncontrolledTooltip>
    </React.Fragment>
  );
};
SidebarTrigger.propTypes = {
  tag: PropTypes.any,
  children: PropTypes.node,
  pageConfig: PropTypes.object
};
SidebarTrigger.defaultProps = {
  tag: NavLink,
  children: <i className='fa fa-bars fa-fw'></i>
};

const cfgSidebarTrigger = withPageConfig(SidebarTrigger);

export { cfgSidebarTrigger as SidebarTrigger };
