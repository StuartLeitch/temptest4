import React, { FunctionComponent, Fragment } from 'react';
import Toggle from 'react-toggle';

interface ReminderToggleProps {
  reminderName: string;
  isActive: boolean;
  name: string;
  onChange: (state: boolean) => void;
}

function labelColor(state: boolean) {
  return state ? 'badge-primary' : 'badge-danger';
}

function label(state: boolean) {
  return (
    <span
      className={`badge ${labelColor(state)} mr-3`}
      style={{ width: '57px', textAlign: 'center' }}
    >
      {state ? 'Active' : 'Paused'}
    </span>
  );
}

const ReminderToggle: FunctionComponent<ReminderToggleProps> = ({
  reminderName,
  isActive,
  name,
  onChange,
}) => {
  return (
    <Fragment>
      <dt className={`col-sm-4 text-lg-right`}>{reminderName}</dt>
      <dd className='col-sm-8 d-flex'>
        <label className='d-flex align-items-middle mb-0 align-items-center'>
          {label(isActive)}
          <Toggle
            checked={isActive}
            onChange={(event) => {
              onChange(event.target.checked);
            }}
            name={name}
          />
        </label>
      </dd>
    </Fragment>
  );
};

export { ReminderToggle };
