import React, { useEffect, useContext, useRef } from 'react';

import {
  FormGroup,
  Label,
  Col,
  FormText,
  InputGroup,
  CustomInput,
} from '../../../../components';

import { MultipleCouponCreateContext } from '../../Context';

const FileInput: React.FC<FileInput> = ({ value, helper = '' }) => {
  const handleChange = (e) => {
    const fileUpload = e.target.files[0];
    chosenContextName.update('inputFile', {
      value: fileUpload,
      isValid: true,
    });
  };

  const chosenContextName = useContext(MultipleCouponCreateContext);

  useEffect(() => {
    if (value) {
      chosenContextName.update('inputFile', { value, isValid: true });
    }
  }, []);

  return (
    <FormGroup row>
      <Label className='font-weight-bold' for='appendToFile' sm={3}>
        Append to file
      </Label>
      <Col sm={9}>
        <InputGroup>
          <CustomInput
            type='file'
            id='file'
            accept='.csv'
            label='No file selected'
            onChange={handleChange}
          />
        </InputGroup>

        {helper && (
          <FormText className='ml-1'>
            <i className='fas fa-info-circle mr-2'></i>
            {helper}
          </FormText>
        )}
      </Col>
    </FormGroup>
  );
};

interface FileInput {
  value?: string;
  disabled?: boolean;
  helper?: string;
}

export default FileInput;
