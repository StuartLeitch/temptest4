import React from 'react';
import PropTypes from 'prop-types';

const DlRowPaymentOptions = props => (
  <React.Fragment>
    <dl className='row'>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Account Name</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        Hindawi Limited
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Account Type</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>FGN Current</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Sort Code</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>090715</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Account NUmber</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>$00113905</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>SWIFT/BIC Code</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>ABBYGB2LXXX</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>IBAN</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        GB60ABBY09071500113905
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Bank Address</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        Santander UK PLC, Corporate Banking, Bridle Road, Bootle, Merseyside,
        L30 4GB
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>
        Beneficiary Address
      </dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        Hindawi Ltd., Adam House, Third Floor, 1 Fitzroy Square, London, W1T
        5HF, UK
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>
        Invoice Ref. No.
      </dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>10752/2019</dd>
    </dl>
    <br />
    <span>Outside the scope of UK VAT as per Article 44 of 2006/112/EC</span>
  </React.Fragment>
);
DlRowPaymentOptions.propTypes = {
  leftSideClassName: PropTypes.node,
  rightSideClassName: PropTypes.node
};
DlRowPaymentOptions.defaultProps = {
  leftSideClassName: '',
  rightSideClassName: ''
};

export { DlRowPaymentOptions };
