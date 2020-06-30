import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { DropdownContext } from 'reactstrap/es/DropdownContext';

const ExtendedDropdownLink = (props) => {
    const { children, ...otherProps } = props;

    return (
        <DropdownContext.Consumer>
        {
            ({ toggle }) => (
                <Link { ...otherProps } onClick={ () => { toggle(); } }>
                    { children }
                </Link>
            )
        }
        </DropdownContext.Consumer>
    );
};
ExtendedDropdownLink.propTypes = {
  onClick: PropTypes.func,
  replace: PropTypes.bool,
  target: PropTypes.string,
  to: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.func
  ]).isRequired
};

export { ExtendedDropdownLink };
