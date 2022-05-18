import React, { ReactNode } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { MenuContext } from './MenuContext';

class SidebarMenu extends React.Component<SidebarMenuProps, SidebarMenuState> {
  static propTypes = {
    children: PropTypes.node,
    currentUrl: PropTypes.string,
    slim: PropTypes.bool,
    location: PropTypes.object,
    pageConfig: PropTypes.object,
    disabled: PropTypes.bool,
  };

  containerRef: React.RefObject<HTMLUListElement> = React.createRef();
  entries = {};

  constructor(props) {
    super(props);

    this.state = {
      entries: (this.entries = {}),
    };
  }

  render() {
    const sidebarMenuClass = classNames('sidebar-menu', {
      'sidebar-menu--disabled': this.props.disabled,
    });

    return (
      <MenuContext.Provider
        value={{
          entries: this.state.entries,
          addEntry: null,
          updateEntry: null,
          removeEntry: null,
        }}
      >
        <ul className={sidebarMenuClass} ref={this.containerRef}>
          {React.Children.map(this.props.children, (child) => (
            <MenuContext.Consumer>
              {(ctx) =>
                React.cloneElement(child as any, {
                  ...ctx,
                })
              }
            </MenuContext.Consumer>
          ))}
        </ul>
      </MenuContext.Provider>
    );
  }
}

interface SidebarMenuProps {
  children: ReactNode;
  currentUrl: string;
  slim: boolean;
  location: any;
  pageConfig: any;
  disabled: boolean;
}

interface SidebarMenuState {
  entries: {
    id?: string;
    exact?: boolean;
  };
}

export { SidebarMenu };
