import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Nav as BsNav } from 'reactstrap';

interface NavProps {
  accent?: boolean;
  className: string;
  [propName: string]: any;
}

const Nav = ({ accent, className, ...otherProps }: NavProps) => (
  <BsNav
    className={
        classNames(className, 'nav', { 'nav-accent': accent })
    }
    { ...otherProps }
  />
)

Nav.propTypes = {
    ...BsNav.propTypes,
    accent: PropTypes.bool,
};
Nav.defaultProps = {
    accent: false
};

export { Nav };
