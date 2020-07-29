import React from 'react';
import { Card, CardBody, CardTitle } from '../../../../components';
import { TimelineMini } from '../../../components/Timeline/TimelineMini';
import format from 'date-fns/format';
import compareDesc from 'date-fns/compareDesc';
import { Invoice } from '../types';

const InvoiceTimeline: React.FC<InvoiceTimelineProps> = ({ invoice }) => (
  <Card className='mb-3'>
    <CardBody>
      <CardTitle tag='h6'>Timeline</CardTitle>

      {invoice?.dateCreated && (
        <TimelineMini
          icon='circle'
          badgeTitle='Draft'
          badgeColor='secondary'
          date={format(new Date(invoice?.dateCreated), 'dd MMMM yyyy')}
          phrase={'Invoice enters DRAFT state.'}
        />
      )}

      {invoice?.dateIssued && (
        <TimelineMini
          icon='times-circle'
          iconClassName='text-primary'
          badgeTitle='Active'
          badgeColor='primary'
          date={format(new Date(invoice?.dateIssued), 'dd MMMM yyyy')}
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
            date={format(
              invoice?.payments
                ?.map((i) => new Date(i.datePaid))
                .sort(compareDesc)[0],
              'dd MMMM yyyy'
            )}
            phrase={'Invoice Payment received.'}
          />
        )}

      {invoice?.dateMovedToFinal && (
        <TimelineMini
          icon='check-circle'
          iconClassName='text-success'
          badgeTitle='Finalized'
          badgeColor='success'
          date={format(new Date(invoice?.dateMovedToFinal), 'dd MMMM yyyy')}
          phrase={'Invoice enters FINAL state.'}
        />
      )}

      {invoice?.creditNote && (
        <TimelineMini
          icon='check-circle'
          iconClassName='text-warning'
          badgeTitle='Credit Note'
          badgeColor='warning'
          date={format(
            new Date(invoice?.creditNote?.dateCreated),
            'dd MMMM yyyy'
          )}
          phrase={'Credit Note issued.'}
        />
      )}

      {invoice?.invoiceItem?.article?.datePublished && (
        <TimelineMini
          icon='play-circle'
          iconClassName='text-blue'
          badgeTitle='Published'
          badgeColor='blue'
          date={format(
            new Date(invoice?.invoiceItem?.article?.datePublished),
            'dd MMMM yyyy'
          )}
          phrase={'Article enters PUBLISHED state.'}
        />
      )}
    </CardBody>
  </Card>
);

interface InvoiceTimelineProps {
  invoice: Invoice;
}

export default InvoiceTimeline;
