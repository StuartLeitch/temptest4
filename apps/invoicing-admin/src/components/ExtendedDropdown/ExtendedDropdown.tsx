import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DropdownMenu } from 'reactstrap';
import { ExtendedDropdownSection } from './ExtendedDropdownSection';
import { ExtendedDropdownLink } from './ExtendedDropdownLink';

export const ExtendedDropdown: React.FC<ExtendedDropdownProps> = (
  {
    className,
    ...otherProps
  }) => {
    const classes = classNames(
        className,
        'extended-dropdown'
    );
    return (
        <DropdownMenu className={ classes } { ...otherProps } />
    );
}


ExtendedDropdown.Section = ExtendedDropdownSection;
ExtendedDropdown.Link = ExtendedDropdownLink;

ExtendedDropdown.propTypes = {
    className: PropTypes.string,
};

interface ExtendedDropdownProps {
  [key: string]: any;
}
