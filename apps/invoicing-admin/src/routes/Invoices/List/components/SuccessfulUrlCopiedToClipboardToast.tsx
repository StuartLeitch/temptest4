import React from 'react';
// import { useHistory } from 'react-router-dom';

import { Media } from './../../../../components';

export default ({ urlToShare }) => {
  // const history = useHistory();

  return (
    <Media>
      <Media middle left className='mr-3'>
        <i className='fas fa-fw fa-2x fa-check'></i>
      </Media>
      <Media body>
        <Media heading tag='h6'>
          Info
        </Media>
        <p>
          The URL{' '}
          <span className='font-weight-normal text-underlined text-blue'>
            <u>{urlToShare}</u>
          </span>{' '}
          has been copied to your clipboard.
        </p>
        {/* <div className='d-flex mt-2'>
          <Button
            color='success'
            onClick={() => {
              closeToast();
              history.push(`/credit-notes/details/${creditNote.id}`);
            }}
          >
            See details
          </Button>
          <Button
            color='link'
            onClick={() => {
              closeToast();
              // window.location = `/invoices/details/${creditNote.id}`;
            }}
            className='ml-2 text-success'
          >
            Cancel
          </Button>
        </div> */}
      </Media>
    </Media>
  );
};
