import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export class SidebarContent extends React.Component<SidebarContentProps, SidebarContentState> {
  static propTypes = {
      children: PropTypes.node,
      slim: PropTypes.bool,
      collapsed: PropTypes.bool,
      animationsDisabled: PropTypes.bool,
      pageConfig: PropTypes.object
  }

  sidebarRef: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props: SidebarContentProps) {
    super(props);

    this.state = {
      entryAnimationFinished: false,
    };
  }

  render() {
    const {
      animationsDisabled,
      collapsed,
      pageConfig,
      slim,
      children,
    } = this.props;

    const sidebarClass = classNames('sidebar', 'sidebar--animations-enabled', {
      'sidebar--slim': slim || pageConfig.sidebarSlim,
      'sidebar--animations-disabled': animationsDisabled || pageConfig.animationsDisabled,
      'sidebar--animate-entry-complete': this.state.entryAnimationFinished,
    });

    return (
      <div className={ sidebarClass } ref={ this.sidebarRef }>
          { children }
      </div>
    );
  }
}

interface SidebarContentProps {
  children: ReactNode;
  slim?: boolean;
  collapsed?: boolean;
  animationsDisabled?: boolean;
  pageConfig?: any;
};

interface SidebarContentState {
  entryAnimationFinished: boolean;
};
