/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';

const DlRowPayerDetails = props => (
  <React.Fragment>
    <dl className='row'>
      {' '}
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Payer Type</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>{props.type}</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Name</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        {props.name} (<a href='#'>{props.email}</a>)
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>VAT Id</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>{props.vatId}</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Organisation</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        {props.organization}
      </dd>
    </dl>
  </React.Fragment>
);
DlRowPayerDetails.propTypes = {
  leftSideClassName: PropTypes.node,
  rightSideClassName: PropTypes.node
};
DlRowPayerDetails.defaultProps = {
  leftSideClassName: '',
  rightSideClassName: ''
};

export { DlRowPayerDetails };
