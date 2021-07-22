import React from 'react';
import { Card, CardBody, CardTitle } from '../../../../components';
import { TimelineMini } from '../../../components/Timeline/TimelineMini';

import  { formatDate } from '../../../../utils/date';

import compareDesc from 'date-fns/compareDesc';
import { Invoice, CreditNote } from '../types';

function renderSwitch(reason) {
  switch (reason) {
    case 'withdrawn-manuscript':
      return 'Withdrawn Manuscript';
    case 'reduction-applied':
      return 'Reduction Applied';
    case 'waived-manuscript':
      return 'Waived Manuscript';
    case 'change-payer-details':
      return 'Change Payer Details';
    case 'bad-debt':
      return 'Bad Debt';
    default:
      return 'Other';
  }
}

const InvoiceTimeline: React.FC<InvoiceTimelineProps> = ({ creditNote, invoice }) => (
  <Card className='mb-3'>
    <CardBody>
      <CardTitle tag='h6'>Timeline</CardTitle>

      {invoice?.dateCreated && (
        <TimelineMini
          icon='circle'
          badgeTitle='Draft'
          badgeColor='secondary'
          date={formatDate(new Date(invoice?.dateCreated))}
          phrase={'Invoice enters DRAFT state.'}
        />
      )}

      {invoice?.dateIssued && (
        <TimelineMini
          icon='times-circle'
          iconClassName='text-primary'
          badgeTitle='Active'
          badgeColor='primary'
          date={formatDate(new Date(invoice?.dateIssued))}
          phrase={'Invoice enters ACTIVE state.'}
        />
      )}

      {invoice?.payments?.length > 0 &&
        invoice?.payments.reduce(
          (acc, p) => acc || p.status === 'COMPLETED',
          false
        ) && (
          <TimelineMini
            icon='check-circle'
            iconClassName='text-success'
            badgeTitle='Paid'
            badgeColor='success'
            date={formatDate(
              invoice?.payments?.map((i) => new Date(i.datePaid)).sort(compareDesc)[0]
            )}
            phrase={'Invoice Payment received.'}
          />
        )}

      {(invoice?.dateMovedToFinal || invoice?.status === 'FINAL') && (
        <TimelineMini
          icon='check-circle'
          iconClassName='text-success'
          badgeTitle='Finalized'
          badgeColor='success'
          date={formatDate(new Date(invoice?.dateMovedToFinal))}
          phrase={'Invoice enters FINAL state.'}
        />
      )}

      {creditNote && (
        <TimelineMini
          icon='check-circle'
          iconClassName='text-warning'
          badgeTitle='Credit Note'
          badgeColor='warning'
          date={formatDate(
            new Date(invoice?.creditNote?.dateCreated)
          )}
          phrase={`
          Credit Note issued.
          Reason: ${renderSwitch(creditNote?.creationReason)}
          `}
        />
      )}

      {invoice?.invoiceItem?.article?.datePublished && (
        <TimelineMini
          icon='play-circle'
          iconClassName='text-blue'
          badgeTitle='Published'
          badgeColor='blue'
          date={formatDate(
            new Date(invoice?.invoiceItem?.article?.datePublished)
          )}
          phrase={'Article enters PUBLISHED state.'}
        />
      )}
    </CardBody>
  </Card>
);

interface InvoiceTimelineProps {
  invoice: Invoice;
  creditNote: CreditNote;
}

export default InvoiceTimeline;
