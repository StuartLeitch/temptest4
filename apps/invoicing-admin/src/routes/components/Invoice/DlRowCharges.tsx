import React from 'react';
import PropTypes from 'prop-types';

const DlRowCharges = props => (
  <React.Fragment>
    <dl className='row'>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>
        Article Processing Charges
      </dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>$950.00</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Net Charges</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>$950.00</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>VAT (0%)</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>$0.00</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Total</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>$950</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>
        Invoice Issue Date
      </dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>9 July 2019</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Date of Supply</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>9 July 2019</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>
        Invoice Ref. No.
      </dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>10752/2019</dd>
    </dl>
    <br />
    <span>Outside the scope of UK VAT as per Article 44 of 2006/112/EC</span>
  </React.Fragment>
);
DlRowCharges.propTypes = {
  leftSideClassName: PropTypes.node,
  rightSideClassName: PropTypes.node
};
DlRowCharges.defaultProps = {
  leftSideClassName: '',
  rightSideClassName: ''
};

export { DlRowCharges };
