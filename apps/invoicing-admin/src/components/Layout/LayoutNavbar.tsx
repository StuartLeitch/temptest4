import React from 'react';
import PropTypes from 'prop-types';

// import { ApplicationHeader } from '@hindawi/phenom-ui';

const LayoutNavbar = (props) => {
    const navbar = React.Children.only(props.children);

    return (
        <div className="layout__navbar">
        {
            React.cloneElement(navbar, { fixed: null })
        }
          {/* <ApplicationHeader
            appName='Cool App Name'
            onClickLogo={() => {
              alert('Logo clicked!');
            }}
            rightSideChildren={<HeaderDropdown />}
          /> */}
        </div>
    );
};

LayoutNavbar.propTypes = {
    children: PropTypes.node
};
LayoutNavbar.layoutPartName = "navbar";

export {
    LayoutNavbar
};
