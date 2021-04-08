import React from 'react';
import PropTypes from 'prop-types';

const DlRowErpReferences = (props) => console.log(props) ||( 
    <React.Fragment>
        <dl className='row'>
            <dt className={`col-sm-1 h5 text-muted ${props.leftSideClassName}`}>Invoice</dt>
            <dd className={`col-sm-9 ${props.rightSideClassName}`}>
                <strong className='text-black-50'>{props.erpReference}</strong>
            </dd>
        </dl>
    </React.Fragment>
)

DlRowErpReferences.propTypes = {
    leftSideClassName: PropTypes.node,
    rightSideClassName: PropTypes.node,
}

DlRowErpReferences.defaultProps = {
    leftSideClassName: '',
    rightSideClassName: '',
}

export {DlRowErpReferences}