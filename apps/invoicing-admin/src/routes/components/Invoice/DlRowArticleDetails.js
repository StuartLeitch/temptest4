import React from 'react';
import PropTypes from 'prop-types';

const DlRowArticleDetails = (props) => (
  <React.Fragment>
    <dl className='row'>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Custom ID</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        <strong className='text-black-50'>{props.customId}</strong>
      </dd>

      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Article Title</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>{props.title}</dd>
      {/* <dt className={`col-sm-3 ${props.leftSideClassName}`}>Article ID</dt> */}
      {/* <dd className={`col-sm-9 ${props.rightSideClassName}`}>{props.id}</dd> */}
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Journal Title</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        {props.journalTitle}
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Article Type</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        {props.articleType}
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>License</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>CC-BY 4.0</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>
        Author (Corresponding)
      </dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        {props.authorFirstName} {props.authorSurname} (
        <a href='#'>{props.authorEmail}</a>)
      </dd>
    </dl>
  </React.Fragment>
);
DlRowArticleDetails.propTypes = {
  leftSideClassName: PropTypes.node,
  rightSideClassName: PropTypes.node,
};
DlRowArticleDetails.defaultProps = {
  leftSideClassName: '',
  rightSideClassName: '',
};

export { DlRowArticleDetails };
