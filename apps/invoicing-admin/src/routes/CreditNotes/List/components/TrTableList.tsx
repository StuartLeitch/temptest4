import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import numeral from 'numeral';

import { Badge } from '../../../../components';

/*eslint-disable */
const CREATION_REASON = {
  WITHDRAWN_MANUSCRIPT : 'withdrawn-manuscript',
  REDUCTION_APPLIED : 'reduction-applied',
  WAIVED_MANUSCRIPT : 'waived-manuscript',
  CHANGED_PAYER_DETAILS : 'changed-payer-details',
  BAD_DEBT : 'bad-debt',
  OTHER : 'other',
};

const TrTableCreditNotesList = ( {creditNotes} ) => (
  <React.Fragment>
    {creditNotes.map(
      ({
        id,
        creationReason,
        persistentReferenceNumber,
        price,
        dateIssued,
        dateAccepted,
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
              <span
                className={ 'text-secondary'}
              >
                <strong>
                    `CN-${persistentReferenceNumber}`
                </strong>
              </span>
            </Link>
          </td>
          <td className='align-middle'>
            <Link
              to={`/credit-notes/details/${id}`}
              className='text-decoration-none'
            >
              <span className='text-secondary'>
             
              </span>
            </Link>
          </td>
          <td className='align-middle text-nowrap'>
            {dateIssued && format(new Date(dateIssued), 'dd MMM yyyy')}
          </td>
          <td className='align-middle'>
            <strong
              className={
                price < 0 ? 'text-danger' : 'text-success'
              }
            >
              {numeral(price).format('$0.00')}
            </strong>
          </td>
          <td className='align-left text-truncate' style={{maxWidth: 200}}>
          
          </td>
          <td className='align-left text-truncate' style={{maxWidth: 200}}></td>
          <td className='align-middle text-nowrap'>
            {dateAccepted && format(new Date(dateAccepted), 'dd MMM yyyy')}
          </td>
        </tr>
      )
    )}
  </React.Fragment>
);

export { TrTableCreditNotesList };
