import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import numeral from 'numeral';

import { Badge } from '../../../components';

/*eslint-disable */
const INVOICE_STATUS = {
  FINAL: (
    <Badge pill color='success'>
      Final
    </Badge>
  ),
  ACTIVE: (
    <Badge pill color='primary'>
      Active
    </Badge>
  ),
  DRAFT: (
    <Badge pill color='secondary'>
      Draft
    </Badge>
  ),
};

import {
  Card,
  Table,
} from '../../../components';

const InvoicesSearchResults: React.FC<SearchListProps> = (props) => {
  return (
    <Card className='mb-0'>
      <span className='bt-6 mt-1 ml-2' style={{ display: 'inline-block'}}><strong>{props.title.toUpperCase()}</strong></span>
      {/* START Table */}
      <div className='table-responsive-xl'>
        <Table className='mb-0 table-striped' hover>
          <thead>
            <tr>
              <th className='align-middle bt-0'>Status</th>
              <th className='align-middle bt-0'>Reference</th>
              <th className='align-middle bt-0'>Manuscript Custom ID</th>
              <th className='align-middle bt-0'>Issue Date</th>
              <th className='align-middle bt-0'>APC</th>
              <th className='align-middle bt-0'>Journal Title</th>
              <th className='align-middle bt-0'>Manuscript Title</th>
              <th className='align-middle bt-0'>Manuscript Acceptance Date</th>
            </tr>
          </thead>
          <tbody>
          {props.searchResults['invoices'].map(
            ({
              id,
              status,
              referenceNumber,
              cancelledInvoiceReference,
              customId,
              manuscriptTitle,
              invoiceItem,
              dateIssued,
              dateAccepted,
            }) => (
              <tr
                key={id}
                className={cancelledInvoiceReference ? 'table-warning' : ''}
              >
                <td className='align-middle'>
                  <div>{INVOICE_STATUS[status]}</div>
                </td>
                <td className='align-middle'>
                  <Link
                    to={
                      cancelledInvoiceReference
                        ? `/credit-notes/details/${id}`
                        : `/invoices/details/${id}`
                    }
                    className='text-decoration-none'
                  >
                    <span
                      className={
                        cancelledInvoiceReference
                          ? 'badge badge-warning'
                          : 'text-secondary'
                      }
                    >
                      <strong>
                        {(cancelledInvoiceReference
                          ? `CN-${referenceNumber}`
                          : referenceNumber) || ' '}
                      </strong>
                    </span>
                  </Link>
                </td>
                <td className='align-middle'>
                  <Link
                    to={
                      cancelledInvoiceReference
                        ? `/credit-notes/details/${id}`
                        : `/invoices/details/${id}`
                    }
                    className='text-decoration-none'
                  >
                    <span className='text-secondary'>
                      {invoiceItem?.article?.customId}
                    </span>
                  </Link>
                </td>
                <td className='align-middle text-nowrap'>
                  {dateIssued && format(new Date(dateIssued), 'dd MMM yyyy')}
                </td>
                <td className='align-middle'>
                  <strong
                    className={
                      invoiceItem?.price < 0 ? 'text-danger' : 'text-success'
                    }
                  >
                    {numeral(invoiceItem && invoiceItem.price).format('$0.00')}
                  </strong>
                </td>
                <td className='align-left text-truncate' style={{maxWidth: 200}}>
                  {invoiceItem?.article?.journalTitle}
                </td>
                <td className='align-left text-truncate' style={{maxWidth: 200}}>{invoiceItem?.article?.title}</td>
                <td className='align-middle text-nowrap'>
                  {dateAccepted && format(new Date(dateAccepted), 'dd MMM yyyy')}
                </td>
              </tr>
            )
          )}
          </tbody>
        </Table>
      </div>
      {/* END Table */}
    </Card>
  );
};

interface SearchListProps {
  title: string,
  searchResults: any[]
}


export default InvoicesSearchResults;
