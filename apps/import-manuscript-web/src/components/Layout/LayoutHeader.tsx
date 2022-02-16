import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const LayoutHeader = (props) => {
    const headerClass = classNames("layout__header", {
        "layout__header--slim": props.sidebarSlim,
        "layout__header--collapsed": props.sidebarCollapsed
    });

    return (
        <div className={ headerClass }>
          { props.children }
        </div>
    );
};

LayoutHeader.propTypes = {
    children: PropTypes.node,
    sidebarSlim: PropTypes.bool,
    sidebarCollapsed: PropTypes.bool
};
LayoutHeader.layoutPartName = "header";

export {
    LayoutHeader
};
