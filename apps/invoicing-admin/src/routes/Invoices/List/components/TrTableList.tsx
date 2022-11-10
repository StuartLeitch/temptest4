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
  let tabularData = invoices.map((i) => {
    // * applied coupons
    let coupons = 0;
    i.invoiceItem.coupons.forEach((c) => {
      coupons += c.reduction;
    });

    // * applied waivers
    let waivers = 0;
    i.invoiceItem.waivers.forEach((w) => {
      waivers += w.reduction;
    });

    const netCharges =
      i.invoiceItem.price * (1 - (coupons + waivers) / 100) * 100;
    const total = netCharges + (netCharges * i.invoiceItem.vat) / 100;
    i.total = Math.round(total) / 100 - i.invoiceItem.taDiscount;

    return i;
  });

  return (
    <React.Fragment>
      {tabularData.map(
        ({
          id,
          status,
          referenceNumber,
          total,

          invoiceItem,
          dateIssued,
          dateAccepted,
        }) => (
          <tr key={id}>
            <td className='align-middle'>
              <div>{INVOICE_STATUS[status]}</div>
            </td>
            <td className='align-middle'>
              <Link
                to={`/invoices/details/${id}`}
                className='text-decoration-none'
              >
                <span className='text-secondary'>
                  {invoiceItem?.article?.customId}
                </span>
              </Link>
            </td>
            <td className='align-middle'>
              <Link
                to={`/invoices/details/${id}`}
                className='text-decoration-none'
              >
                <span
                  className={
                    invoiceItem?.total < 0 ? 'text-danger' : 'text-success'
                  }
                >
                  <strong>{referenceNumber || ' '}</strong>
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
  );
};

function formatDate(date) {
  return format(addMinutes(date, date.getTimezoneOffset()), 'dd MMM yyyy');
}

export { TrTableInvoicesList };
