import React from 'react';

import {
  Table
} from '../../../../components';
import { TrTableInvoicesList } from './TrTableList';

const InvoicesTableBody = (props) => {

  if (!props.data) return null;

  return (
    <div className='table-responsive-xl'>
      {/* START Table */}
      <Table className='mb-0 table-striped' hover>
        <thead>
          <tr>
            <th className='align-middle bt-0'>Status</th>
            <th className='align-middle bt-0'>Manuscript Custom ID</th>
            <th className='align-middle bt-0'>Reference Number</th>
            <th className='align-middle bt-0'>Issue Date</th>
            <th className='align-middle bt-0'>Total</th>
            <th className='align-middle bt-0'>Accepted Date</th>
          </tr>
        </thead>
        <tbody>
          <TrTableInvoicesList invoices={props.data.invoices} />
        </tbody>
      </Table>
      {/* END Table */}
    </div>
  )};

  export { InvoicesTableBody};
