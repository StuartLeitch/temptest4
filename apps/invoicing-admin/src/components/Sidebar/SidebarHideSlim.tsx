import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const SidebarHideSlim = ({ children }): ReactNode => {
    return React.Children.map(children, (child) =>
        React.cloneElement(child, {
            className: classNames(
                child.props.className,
                'sidebar__hide-slim'
            )
        })
    );
};

SidebarHideSlim.propTypes = {
    children: PropTypes.node,
};
