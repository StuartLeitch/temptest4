import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

import { Consumer } from './context';

const UncontrolledModalClose = (props) => {
  const { tag, onClose, ...otherProps } = props;
  const Tag = tag;

  const onClickHandler = (e) => {
    e.toggleModal();
    if (onClose) onClose();
  };

  return (
    <Consumer>
      {(value) => <Tag {...otherProps} onClick={() => onClickHandler(value)} />}
    </Consumer>
  );
};

UncontrolledModalClose.propTypes = {
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
};

UncontrolledModalClose.defaultProps = {
  tag: Button,
};

export { UncontrolledModalClose };
