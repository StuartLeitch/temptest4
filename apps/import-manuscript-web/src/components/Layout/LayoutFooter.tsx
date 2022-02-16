import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const LayoutFooter = (props) => {
    const footerClass = classNames("layout__footer", {
        "layout__footer--slim": props.sidebarSlim,
        "layout__footer--collapsed": props.sidebarCollapsed
    });

    return (
        <div className={ footerClass }>
          { props.children }
        </div>
    );
};

LayoutFooter.propTypes = {
    children: PropTypes.node,
    sidebarSlim: PropTypes.bool,
    sidebarCollapsed: PropTypes.bool
};
LayoutFooter.layoutPartName = "footer";

export {
    LayoutFooter
};
