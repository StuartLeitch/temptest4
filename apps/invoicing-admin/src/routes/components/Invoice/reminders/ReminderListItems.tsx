import React, { FunctionComponent } from 'react';
import  { formatDateWithMinutes } from '../../../../utils/date';

import { ListGroupItem } from '../../../../components';

interface ReminderListItemProps {
  toEmail: string;
  type: string;
  when: string;
}

const ReminderListHeader: FunctionComponent<unknown> = () => {
  return (
    <ListGroupItem className='font-weight-bold text-gray-900'>
      <div className='row align-items-center justify-content-between'>
        <span style={{ textAlign: 'center', flex: '1' }}>Reminder Type</span>
        <span style={{ textAlign: 'center', flex: '1' }}>Sent to email</span>
        <span style={{ textAlign: 'center', flex: '1' }}>Sent on</span>
      </div>
    </ListGroupItem>
  );
};

const ReminderListItem: FunctionComponent<ReminderListItemProps> = ({
  toEmail,
  type,
  when,
}) => {
  return (
    <ListGroupItem>
      <div className='row align-items-center justify-content-between'>
        <span style={{ textAlign: 'center', flex: '1' }}>{type}</span>
        <span style={{ textAlign: 'center', flex: '1' }}>{toEmail}</span>
        <span style={{ textAlign: 'center', flex: '1' }}>
          {formatDateWithMinutes(new Date(when))}
        </span>
      </div>
    </ListGroupItem>
  );
};

export { ReminderListItem, ReminderListHeader };
