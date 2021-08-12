import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import numeral from 'numeral';

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

const TrTableCreditNotesList = ({creditNotes}) => (
  <React.Fragment>
    {creditNotes.creditNotes.map(
      ({
        id,
        creationReason,
        persistentReferenceNumber,
        price,
        vat,
        dateIssued,
        dateCreated,
        invoice
      }) => (
        <tr key={id} className='table-warning'>
          <td className='align-middle'>
            <Badge>{CREATION_REASON[creationReason]}</Badge>
          </td>
          <td className='align-left'>{invoice?.invoiceItem?.article?.customId}</td>
          <td className='align-middle'>
            <Link
              to={`/credit-notes/details/${id}`}
              className='text-decoration-none'
            >
              <span className={'text-secondary'}>
                <strong>
                    {persistentReferenceNumber}
                </strong>
              </span>
            </Link>
          </td>

          <td className='align-middle'>{dateIssued && format(new Date(dateIssued), 'dd MMM yyyy')}</td>

          <td className='align-middle'>
            <strong
              className='text-danger'
            >
              {numeral(price).format('$0.00')}
            </strong>
          </td>
        </tr>
      )
    )}
  </React.Fragment>
);

export { TrTableCreditNotesList };
