/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import PropTypes from 'prop-types';

const DlRowBilledTo = props => (
  <React.Fragment>
    <dl className='row'>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Payer Name</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>Wen-Hai Shao</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Email</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        <a href='#'>shaowi@ucmail.uc.edu</a>
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Institution</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        Division of Immunology Allergy and Rheumatology Department of Internal
        Medicine
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Address</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        College of Medicine, University of Cincinnati
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>State</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        <a href='#'>Ohio</a>
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>ZIP</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>45267</dd>
    </dl>
  </React.Fragment>
);
DlRowBilledTo.propTypes = {
  leftSideClassName: PropTypes.node,
  rightSideClassName: PropTypes.node
};
DlRowBilledTo.defaultProps = {
  leftSideClassName: '',
  rightSideClassName: ''
};

export { DlRowBilledTo };
