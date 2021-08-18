import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import numeral from 'numeral';

import { formatDate } from '../../../../utils/date';
import { totalAmount } from '../../../../utils/totalAmount'
import { Badge } from '../../../../components';

/*eslint-disable */
const CREATION_REASON = {
  'withdrawn-manuscript' : 'Withdrawn Manuscript',
  'reduction-applied' : 'Reduction Applied',
  'waived-manuscript' : 'Waived Manuscript',
  'change-payer-details' : 'Change Payer Details',
  'bad-debt' : 'Bad Debt',
  'other' : 'Other',
};

const TrTableCreditNotesList = ({creditNotes}) => {
  let tabularData = creditNotes.creditNotes.map(i => {
    // * applied coupons
    let coupons = 0;
    i.invoice.invoiceItem.coupons.forEach(c => {
      coupons += c.reduction;
    });

    // * applied waivers
    let waivers = 0;
    i.invoice.invoiceItem.waivers.forEach(w => {
      waivers += w.reduction;
    })

    i.total = -(Math.round(i.invoice.invoiceItem.price * (1 - (coupons + waivers) / 100) * 100) / 100);

    return i;
  });

  return (
    <React.Fragment>
      {tabularData.map(
        ({
          id,
          creationReason,
          invoice,
          price,
          vat,
          total,
          dateIssued,
          dateCreated,
          persistentReferenceNumber
        }) => (
          <tr key={id}>
            <td className='align-middle'>
              <Badge>{CREATION_REASON[creationReason]}</Badge>
            </td>
            <td className='align-left'>
              <Link
                  to={`/credit-notes/details/${id}`}
                  className='text-decoration-none'
                >{invoice?.invoiceItem?.article?.customId}
              </Link>
            </td>
            <td className='align-middle'>
              <Link
                to={`/credit-notes/details/${id}`}
                className='text-decoration-none'
              >
                <span className={'text-warning'}>
                  <strong>
                      {persistentReferenceNumber}
                  </strong>
                </span>
              </Link>
            </td>

            <td className='align-middle'>{dateIssued && formatDate(new Date(dateIssued))}</td>

            <td className='align-middle'>
              <strong
                className='text-danger'
              >
                {numeral(total).format('$0.00')}
              </strong>
            </td>
          </tr>
        )
      )}
    </React.Fragment>
  )
};

export { TrTableCreditNotesList };
