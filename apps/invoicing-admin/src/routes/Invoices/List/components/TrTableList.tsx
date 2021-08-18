import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import addMinutes from 'date-fns/addMinutes';
import numeral from 'numeral';

import { Badge } from '../../../../components';

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

const TrTableInvoicesList = ({ invoices }) => {
  let tabularData = invoices.map(i => {
    // * applied coupons
    let coupons = 0;
    i.invoiceItem.coupons.forEach(c => {
      coupons += c.reduction;
    });

    // * applied waivers
    let waivers = 0;
    i.invoiceItem.waivers.forEach(w => {
      waivers += w.reduction;
    })

    i.total = Math.round(i.invoiceItem.price * (1 - (coupons + waivers) / 100) * 100) / 100;

    return i;
  });

  return (
    <React.Fragment>
      {tabularData.map(
        ({
          id,
          status,
          referenceNumber,
          cancelledInvoiceReference,
          // customId,
          // manuscriptTitle,
          total,

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
                <span className='text-secondary'>
                  {invoiceItem?.article?.customId}
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
                <span
                  className={
                    invoiceItem?.total < 0 ? 'text-danger' : 'text-success'
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
            <td className='align-middle text-nowrap'>
              {dateIssued && formatDate(new Date(dateIssued))}
            </td>
            <td className='align-middle'>
              <strong
                className={
                  invoiceItem?.price < 0 ? 'text-danger' : 'text-success'
                }
              >
                {numeral(total).format('$0.00')}
              </strong>
            </td>
            <td className='align-middle text-nowrap'>
              {dateAccepted && formatDate(new Date(dateAccepted))}
            </td>
          </tr>
        )
      )}
    </React.Fragment>
  )
};

function formatDate(date) {
  return format(addMinutes(date, date.getTimezoneOffset()), 'dd MMM yyyy');
}

export { TrTableInvoicesList };
