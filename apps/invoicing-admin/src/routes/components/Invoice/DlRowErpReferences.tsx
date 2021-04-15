import React from 'react';
import PropTypes from 'prop-types';

const DlRowErpReferences = (props) => (
    <React.Fragment>
        <dl className='row'>
            <dt className={`col-sm-5 ${props.leftSideClassName}`}>Invoice</dt>
            <dd className={`col-sm-5 ${props.rightSideClassName}`}>
                {props.erpReferences?.map(e => e.attribute === 'confirmation' ? <strong key='invoice' className='text-black-50 ml-5'>{e.value}</strong> : '' )}
            </dd>
        </dl>

        <dl className='row'>
            <dt className={`col-sm-5 ${props.leftSideClassName}`}>Payment</dt>
            <dd className={`col-sm-5 mr-1 ${props.rightSideClassName}`}>
                {props.erpReferences?.map(e => e.attribute === 'payment' ? <strong key='payment' className='text-black-50 ml-5'>{e.value}, </strong> : '' )}
            </dd>
        </dl>

        <dl className='row'>
            <dt className={`col-sm-5 ${props.leftSideClassName}`}>Revenue Recognition</dt>
            <dd className={`col-sm-5 ${props.rightSideClassName}`}>
                {props.erpReferences?.map(e => e.attribute === 'revenueRecognition' ? <strong key='revenue-recognition' className='text-black-50 ml-5'>{e.value}</strong> : '' )}
            </dd>
        </dl>

        <dl className='row'>
            <dt className={`col-sm-5 ${props.leftSideClassName}`}>Credit Note</dt>
            <dd className={`col-sm-5 ${props.rightSideClassName}`}>
                {props.creditNote?.erpReferences?.map(e => e.attribute === 'creditNote' ? <strong key='credit-note' className='text-black-50 ml-5'>{e.value}</strong> : '' )}
            </dd>
        </dl>

        <dl className='row'>
            <dt className={`col-sm-5 ${props.leftSideClassName}`}>Revenue Recognition Reversal</dt>
            <dd className={`col-sm-5 ${props.rightSideClassName}`}>
                {props.erpReferences?.map(e => e.attribute === 'revenueRecognitionReversal' ? <strong key='rev-rec-reversal' className='text-black-50 ml-5'>{e.value}</strong> : '' )}
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
