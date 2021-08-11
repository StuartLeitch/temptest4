import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import numeral from 'numeral';

import { formatDate } from '../../../../utils/date';

/*eslint-disable */
const CREATION_REASON = {
  'withdrawn-manuscript' : 'Withdrawn Manuscript',
  'reduction-applied' : 'Reduction Applied',
  'waived-manuscript' : 'Waived Manuscript',
  'change-payer-details' : 'Change Payer Details',
  'bad-debt' : 'Bad Debt',
  'other' : 'Other',
};

const TrTableCreditNotesList = ({creditNotes}) => (
  <React.Fragment>
    {creditNotes.creditNotes.map(
      ({
        id,
        creationReason,
        invoice,
        price,
        vat,
        dateIssued,
        persistentReferenceNumber,
      }) => (
        <tr key={id}>
          <td className='align-middle'>
            <div>{CREATION_REASON[creationReason]}</div>
          </td>

          <td className='align-middle'>
            <Link
              to={`/credit-notes/details/${id}`}
              className='text-decoration-none'
            >
              <span className={ 'text-secondary'}>
                <strong>
                    {invoice?.invoiceItem?.article?.customId}
                </strong>
              </span>
            </Link>
          </td>

          <td className='align-middle'>
            <Link
              to={`/credit-notes/details/${id}`}
              className='text-decoration-none'
            >
              <span className={ 'text-secondary'}>
                <strong>
                    {persistentReferenceNumber}
                </strong>
              </span>
            </Link>
          </td>

          <td className='align-middle text-nowrap'>
            {dateIssued && formatDate(new Date(dateIssued))}
          </td>

         <td className='align-middle'>
            <strong
              className={price < 0 ? 'text-danger' : 'text-success'}
            >
              {numeral(price + vat).format('$0.00')}
            </strong>
          </td>

        </tr>
      )
    )}
  </React.Fragment>
);

export { TrTableCreditNotesList };
