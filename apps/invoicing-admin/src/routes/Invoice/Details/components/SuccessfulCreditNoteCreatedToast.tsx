import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Media } from '../../../../components';

const SuccessfulCreditNoteCreatedToast: React.FC<
  SuccessfulCreditNoteCreatedToastProps
> = ({ closeToast, creditNote }) => {
  const navigate = useNavigate();

  return (
    <Media>
      <Media middle left className='mr-3'>
        <i className='fas fa-fw fa-2x fa-check'></i>
      </Media>
      <Media body>
        <Media heading tag='h6'>
          Success!
        </Media>
        <p>You've successfully created a Credit Note.</p>
        <div className='d-flex mt-2'>
          <Button
            color='success'
            onClick={() => {
              closeToast();
              navigate(`/credit-notes/details/${creditNote.id}`);
            }}
          >
            See details
          </Button>
          <Button
            color='link'
            onClick={() => {
              closeToast();
            }}
            className='ml-2 text-success'
          >
            Cancel
          </Button>
        </div>
      </Media>
    </Media>
  );
};

interface SuccessfulCreditNoteCreatedToastProps {
  creditNote?: {
    id: string;
  };
  closeToast(): void;
}

export default SuccessfulCreditNoteCreatedToast;
