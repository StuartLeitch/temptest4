import React, { ReactNode } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { LayoutContent } from './LayoutContent';
import { LayoutHeader } from './LayoutHeader';
import { LayoutNavbar } from './LayoutNavbar';
import config from '../../config';

const findChildByType = (children, targetType) => {
  let result;

  React.Children.forEach(children, (child) => {
    if (child.type.layoutPartName === targetType.layoutPartName) {
      result = child;
    }
  });

  return result;
};
const findChildrenByType = (children, targetType) => {
  return _.filter(
    React.Children.toArray(children),
    (child) => (child as any).type.layoutPartName === targetType.layoutPartName
  );
};

class Layout extends React.Component<LayoutProps, LayoutState> {
  static propTypes = {
    children: PropTypes.node,
    sidebarSlim: PropTypes.bool,
    location: PropTypes.object,
    favIcons: PropTypes.array,
    Header: PropTypes.any,
    Footer: PropTypes.any,
    Content: PropTypes.any,
  };
  lastLgSidebarCollapsed: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  bodyElement: HTMLElement;
  documentElement: HTMLElement;

  constructor(props) {
    super(props);

    this.state = {
      animationsDisabled: true,

      pageTitle: null,
      pageDescription: config.siteDescription,
      pageKeywords: config.siteKeywords,
    };

    this.lastLgSidebarCollapsed = false;
    this.containerRef = React.createRef();
  }

  render() {
    const { children } = this.props;
    const header = findChildByType(children, LayoutHeader);
    const navbar = findChildrenByType(children, LayoutNavbar);
    const content = findChildByType(children, LayoutContent);
    const layoutClass = classNames('layout', 'layout--animations-enabled', {});

    return (
      <div className={classNames(layoutClass)} ref={this.containerRef}>
        <div className='layout__wrap'>
          {header}
          {navbar}
          {content}
        </div>
      </div>
    );
  }
}

interface LayoutProps {
  children: ReactNode;
  sidebarSlim?: boolean;
  location?: {
    pathname: string;
  };
  favIcons?: any;
}

interface LayoutState {
  animationsDisabled: boolean;
  pageTitle: string | null;
  pageDescription: string;
  pageKeywords: string;
}

export { Layout };
