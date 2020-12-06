/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

import { Consumer } from './context';

class NestedDropdownSubmenu extends React.Component<NestedDropdownSubmenuProps> {

  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node
    ]),
    tag: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]),
    subMenuTag: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.func
    ]),
    className: PropTypes.string,
    // Context Provided:
    openId: PropTypes.string,
    onOpen: PropTypes.func.isRequired
  };

  static defaultProps = {
    tag: "div",
    subMenuTag: "div"
  };

  id: string;
  componentDidMount() {
      this.id = uuidv4();
  }

  render() {
    const {
        tag: Tag,
        subMenuTag: SubMenuTag,
        title,
        children,
        className,
        openId,
        onOpen
    } = this.props;
    const itemClass = classNames(className, 'nested-dropdown__submenu-item', {
        'nested-dropdown__submenu-item--open': openId === this.id
    });
    const linkClass = classNames('nested-dropdown__submenu-item__link', 'dropdown-item');

    return (
        <Tag className={ itemClass }>
            <a
              href="javascript:;"
              className={ linkClass }
              onClick={ () => { onOpen(this.id) } }
            >
                { title }
            </a>
            <div className="nested-dropdown__submenu-item__menu-wrap">
                <SubMenuTag className="nested-dropdown__submenu-item__menu dropdown-menu">
                    { children }
                </SubMenuTag>
            </div>
        </Tag>
    );
  }
}

const ContextNestedDropdownSubmenu = (props) => (
    <Consumer>
    {
        (contextProps) => (
            <NestedDropdownSubmenu { ...contextProps } { ...props } />
        )
    }
    </Consumer>
);

interface NestedDropdownSubmenuProps {
  tag: any;
  subMenuTag: any;
  title: string;
  children: any;
  className: string;
  openId: string;
  onOpen(id: string): void;
}

export {
    ContextNestedDropdownSubmenu as NestedDropdownSubmenu
};
