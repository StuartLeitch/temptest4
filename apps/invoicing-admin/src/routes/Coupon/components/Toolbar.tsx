import React, { useContext } from 'react';

import { Button, ButtonToolbar } from '../../../components';

import { CouponContext } from '../Context';

import { CouponMode } from '../types';

export default ({
  mode,
  saveEditedCoupon,
  cancelEdit,
  updateInProgress,
  setMode,
}: ToolbarProps) => {
  const isEditModeOn = mode === 'EDIT';

  const { couponState } = useContext(CouponContext);

  const hasFormErrors = Object.values(couponState).some(
    (field) => !field.isValid
  );

  return (
    <ButtonToolbar className='ml-auto'>
      {!isEditModeOn && (
        <Button
          color='success'
          size='sm'
          className='mr-2'
          onClick={() => setMode('EDIT')}
        >
          <i className='fas fa-edit mr-2'></i>
          EDIT
        </Button>
      )}

      {isEditModeOn && (
        <Button
          color='primary'
          size='sm'
          className='mr-2'
          onClick={saveEditedCoupon}
          disabled={hasFormErrors}
        >
          {updateInProgress ? (
            <i className='fas fa-fw fa-spinner fa-spin mr-2'></i>
          ) : (
            <i className='fas fa-check mr-2'></i>
          )}
          SAVE
        </Button>
      )}

      {isEditModeOn && (
        <Button color='danger' outline size='sm' onClick={cancelEdit}>
          Cancel
        </Button>
      )}
    </ButtonToolbar>
  );
};

interface ToolbarProps {
  mode: CouponMode;
  updateInProgress: boolean;
  saveEditedCoupon: Function;
  setMode: Function;
  cancelEdit: Function;
}
