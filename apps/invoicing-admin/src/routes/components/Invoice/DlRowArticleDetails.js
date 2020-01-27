import React from 'react';
import PropTypes from 'prop-types';

const DlRowArticleDetails = props => (
  <React.Fragment>
    <dl className='row'>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Journal Title</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        Disease Markers
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Article Title</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>
        Gas6/TAM receptors in systemic lupus erythematosus
      </dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Article ID</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>7838195</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>Article Type</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>Review Article</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>License</dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>CC-BY 4.0</dd>
      <dt className={`col-sm-3 ${props.leftSideClassName}`}>
        Author (Corresponding) S
      </dt>
      <dd className={`col-sm-9 ${props.rightSideClassName}`}>Shao Wen-Hai</dd>
    </dl>
  </React.Fragment>
);
DlRowArticleDetails.propTypes = {
  leftSideClassName: PropTypes.node,
  rightSideClassName: PropTypes.node
};
DlRowArticleDetails.defaultProps = {
  leftSideClassName: '',
  rightSideClassName: ''
};

export { DlRowArticleDetails };
