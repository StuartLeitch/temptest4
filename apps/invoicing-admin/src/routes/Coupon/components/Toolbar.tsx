import React, { useContext } from 'react';

import { Button, ButtonToolbar } from '../../../components';

import { CouponEditContext, CouponCreateContext } from '../Context';

import { CouponMode } from '../types';

import { VIEW, EDIT, CREATE } from '../config';

export default ({
  mode,
  onSave,
  onCancel,
  isSaveInProgress,
  onEdit,
}: ToolbarProps) => {
  const isViewModeOn = mode === VIEW;
  const isEditModeOn = mode === EDIT;
  const isCreateModeOn = mode === CREATE;
  const canBeSaved = isEditModeOn || isCreateModeOn;

  const chosenContext = isCreateModeOn
    ? CouponCreateContext
    : CouponEditContext;
  const { couponState } = useContext(chosenContext);

  const hasFormErrors = Object.values(couponState).some(
    (field) => !field.isValid
  );

  return (
    <ButtonToolbar className='ml-auto'>
      {isViewModeOn && (
        <Button color='success' size='sm' className='mr-2' onClick={onEdit}>
          <i className='fas fa-edit mr-2'></i>
          EDIT
        </Button>
      )}

      {canBeSaved && (
        <Button
          color='primary'
          size='sm'
          className='mr-2'
          onClick={onSave}
          disabled={hasFormErrors}
        >
          {isSaveInProgress ? (
            <i className='fas fa-fw fa-spinner fa-spin mr-2'></i>
          ) : (
            <i className='fas fa-check mr-2'></i>
          )}
          SAVE
        </Button>
      )}

      {canBeSaved && (
        <Button color='danger' outline size='sm' onClick={onCancel}>
          Cancel
        </Button>
      )}
    </ButtonToolbar>
  );
};

interface ToolbarProps {
  mode: CouponMode;
  isSaveInProgress: boolean;
  onSave: Function;
  onEdit?: Function;
  onCancel: Function;
}
