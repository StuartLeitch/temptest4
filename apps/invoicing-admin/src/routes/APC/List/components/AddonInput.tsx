import React from 'react';
import PropTypes from 'prop-types';

import {
    InputGroup,
    InputGroupAddon,
    Input,
    Button
} from '../../../../components';

// eslint-disable-next-line react/display-name
const AddonInputFR = React.forwardRef((props: any, ref) => (
    <InputGroup className={props.className}>
      <InputGroupAddon addonType="prepend">
        <i className="fas fa-o fa-calendar"></i>
      </InputGroupAddon>
      <Button
        style={{ backgroundColor: '#eee', color: '#5D636D', border: '1px solid #DEE2E6', borderRadius: '0.25rem'}}
        onClick={ props.onClick }
        onChange={ props.onChange }
        ref={ ref }
      >{ props.value }</Button>
    </InputGroup>
));

AddonInputFR.propTypes = {
    onClick: PropTypes.func,
    onChange: PropTypes.func,
    value: PropTypes.string,
    className: PropTypes.string
}

export { AddonInputFR as AddonInput };
