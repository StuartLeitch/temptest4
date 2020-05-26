import React, { useContext } from 'react';

import { CouponCreateContext } from '../../Context';

import Code from './Code';

import { CREATE } from '../../config';

const CreateCode = ({ label = '' }: CreateCodeProps) => {
  const chosenContext = CouponCreateContext;
  const { update } = useContext(chosenContext);

  const updateStoreWithValue = (value, isValid) => {
    update('code', { value, isValid });
  };

  return (
    <Code label={label} onChangeCallback={updateStoreWithValue} mode={CREATE} />
  );
};

interface CreateCodeProps {
  label?: string;
}

export default CreateCode;
