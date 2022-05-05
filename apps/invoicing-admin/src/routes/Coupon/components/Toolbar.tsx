import React, { useContext } from 'react';
import { Button, IconEdit } from '@hindawi/phenom-ui';

import { ButtonToolbar } from '../../../components';
import Restricted from '../../../contexts/Restricted';

import { CouponEditContext, CouponCreateContext } from '../Context';

import { CouponMode } from '../types';

import { VIEW, EDIT, CREATE } from '../config';

const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  onSave,
  onCancel,
  isSaveInProgress,
  onEdit,
}) => {
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
    <Restricted to='edit.coupon'>
      <ButtonToolbar className='ml-auto'>
        {isViewModeOn && (
          <Button
            type='primary'
            className='mr-2'
            onClick={onEdit}
            icon={<IconEdit />}
          >
            EDIT
          </Button>
        )}

        {canBeSaved && (
          <Button
            type='primary'
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
          <Button type='ghost' onClick={onCancel}>
            Cancel
          </Button>
        )}
      </ButtonToolbar>
    </Restricted>
  );
};

interface ToolbarProps {
  mode: CouponMode;
  isSaveInProgress: boolean;
  onSave(): void;
  onEdit?(): void;
  onCancel(): void;
}

export default Toolbar;
