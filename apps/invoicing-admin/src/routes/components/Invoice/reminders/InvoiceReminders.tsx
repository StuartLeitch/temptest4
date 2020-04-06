import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';
import { useParams } from 'react-router-dom';

import { ListGroup, CardTitle, Spinner, Card } from './../../../../components';

import { QueryRemindersState, QuerySentReminders } from './types';
import { TOGGLE_CONFIRMATION, TOGGLE_PAYMENT } from './mutations';
import { REMINDERS_STATUS, SENT_REMINDERS } from './queries';
import { onToggle } from './utils';

import { ReminderListHeader, ReminderListItem } from './ReminderListItems';
import { ReminderToggle } from './ReminderToggle';

function spinner(show: boolean) {
  return (
    <LoadingOverlay
      active={show}
      spinner={
        <Spinner style={{ width: '12em', height: '12em' }} color='primary' />
      }
    />
  );
}

const InvoiceReminders = () => {
  const { id } = useParams();
  const queryOptions = { variables: { id } };
  const sentRemindersResponse = useQuery<QuerySentReminders>(
    SENT_REMINDERS,
    queryOptions
  );
  const statusResponse = useQuery<QueryRemindersState>(
    REMINDERS_STATUS,
    queryOptions
  );
  const [confirmationMutation] = useMutation(TOGGLE_CONFIRMATION);
  const [paymentMutation] = useMutation(TOGGLE_PAYMENT);

  const [loading, setLoading] = useState(
    statusResponse.loading || sentRemindersResponse.loading
  );
  const [error, setError] = useState(
    statusResponse.error || sentRemindersResponse.error
  );

  const [remindersPauseState, setRemindersPauseState] = useState({
    confirmation: true,
    payment: true,
  });

  useEffect(() => {
    setLoading(statusResponse.loading || sentRemindersResponse.loading);
    setError(statusResponse.error || sentRemindersResponse.error);
    if (statusResponse.data) {
      setRemindersPauseState(statusResponse.data.remindersStatus);
    }
  }, [
    sentRemindersResponse.loading,
    sentRemindersResponse.error,
    statusResponse.loading,
    statusResponse.error,
    statusResponse.data,
  ]);

  if (loading) {
    return spinner(loading);
  }
  if (error || typeof statusResponse.data === undefined) {
    return <div>Something Bad Happened</div>;
  }

  const toggleReminderState = onToggle(
    setLoading,
    setError,
    setRemindersPauseState,
    id
  );
  const sentReminders = sentRemindersResponse.data.remindersSent;

  return (
    <React.Fragment>
      <Card body className='border-top-0'>
        <CardTitle tag='h6' className='mb-4'>
          Reminders Status
        </CardTitle>

        <dl className='row'>
          <ReminderToggle
            isActive={!remindersPauseState.confirmation}
            reminderName='Confirmation Reminders'
            name='confirmation'
            onChange={toggleReminderState(
              confirmationMutation,
              'togglePauseConfirmationReminders'
            )}
          />
          <ReminderToggle
            isActive={!remindersPauseState.payment}
            reminderName='Payment Reminders'
            name='payment'
            onChange={toggleReminderState(
              paymentMutation,
              'togglePausePaymentReminders'
            )}
          />
        </dl>

        <ListGroup flush style={{ boxShadow: 'none' }}>
          <ReminderListHeader />
          {sentReminders.map((reminder, index) => {
            return (
              <ReminderListItem
                toEmail={reminder.toEmail}
                type={reminder.type}
                when={reminder.when}
                key={index}
              />
            );
          })}
        </ListGroup>
      </Card>
    </React.Fragment>
  );
};

export { InvoiceReminders };
