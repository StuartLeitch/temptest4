import React from 'react';
import { Card, CardBody, CardTitle } from '../../../../components';
import { DlRowPayerDetails } from '../../../components/Invoice/DlRowPayerDetails';
import { Invoice } from '../types';

const PayerDetailsTab: React.FC<PayerDetailsTabProps> = ({ invoice }) => (
  <Card body className='border-top-0'>
    <CardBody>
      <CardTitle tag='h6' className='mb-4'>
        Payer: Details
        <span className='small ml-1 text-muted'>#{invoice?.payer?.id}</span>
      </CardTitle>
      <div className='mt-4 mb-2'>
        <span className='small'>Contact</span>
      </div>
      <DlRowPayerDetails
        {...invoice?.payer}
        leftSideClassName='text-lg-right'
        rightSideClassName='text-inverse'
      />
      <div className='mt-4 mb-2'>
        <span className='small'>Address</span>
      </div>
      <dl className='row'>
        {' '}
        <dt className={`col-sm-3 text-lg-right`}>Address Line 1</dt>
        <dd className={`col-sm-9 text-inverse`}>
          {invoice?.payer?.address?.addressLine1}
        </dd>
        <dt className={`col-sm-3 text-lg-right`}>City</dt>
        <dd className={`col-sm-9 text-inverse`}>
          {invoice?.payer?.address?.city}
        </dd>
        <dt className={`col-sm-3 text-lg-right`}>Country</dt>
        <dd className={`col-sm-9 text-inverse`}>
          {invoice?.payer?.address?.country}
        </dd>
        <dt className={`col-sm-3 text-lg-right`}>State</dt>
        <dd className={`col-sm-9 text-inverse`}>
          {invoice?.payer?.address?.state}
        </dd>
        <dt className={`col-sm-3 text-lg-right`}>Postal Code</dt>
        <dd className={`col-sm-9 text-inverse`}>
          {invoice?.payer?.address?.postalCode}
        </dd>
      </dl>
    </CardBody>
  </Card>
);

interface PayerDetailsTabProps {
  invoice: Invoice;
}

export default PayerDetailsTab;
