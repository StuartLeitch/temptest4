import React from 'react';
import PropTypes from 'prop-types';

const HeaderAuth = (props) => (
  <div className='mb-4'>
    <div className='mb-4 text-center'>
      {props.icon ? (
        <i className={`fas fa-fw fa-times fa-3x ${props.iconClassName}`}></i>
      ) : null}
    </div>
    <h5 className='text-center mb-4'>{props.title}</h5>
    <p className='text-center'>{props.text}</p>
  </div>
);
HeaderAuth.propTypes = {
  icon: PropTypes.node,
  iconClassName: PropTypes.node,
  title: PropTypes.node,
  text: PropTypes.node,
};
HeaderAuth.defaultProps = {
  title: 'Waiting for Data...',
  text: '',
  iconClassName: 'text-theme',
};

export { HeaderAuth };
