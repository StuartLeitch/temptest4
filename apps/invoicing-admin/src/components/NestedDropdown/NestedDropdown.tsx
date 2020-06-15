import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { UncontrolledDropdown } from 'reactstrap';

import { Provider } from './context';

export class NestedDropdown extends React.Component<NestedDropdownProps, { openId: null | string}> {

  static propTypes = {
    tag: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]),
    className: PropTypes.string,
    children: PropTypes.node
  };
  static defaultProps = {
      tag: UncontrolledDropdown
  };

  static Submenu: (props: any) => JSX.Element;

  constructor(props: NestedDropdownProps) {
      super(props);

      this.state = {
          openId: null
      }
  }

  handleOpen(targetId: string): void {
      this.setState({
          openId: targetId
      });
  }

  render() {
    const { tag: Tag, className, children, ...otherProps } = this.props;
    const dropdownClass = classNames(className, 'nested-dropdown');

    return (
      <Tag { ...otherProps } className={ dropdownClass } >
        <Provider
            value={{
                openId: this.state.openId,
                onOpen: this.handleOpen.bind(this)
            }}
        >
          { children }
        </Provider>
      </Tag>
    );
  }
}

interface NestedDropdownProps {
  tag: any;
  className?: string;
  children: ReactNode;
  nav?: boolean;
  inNavbar?: boolean;
}
