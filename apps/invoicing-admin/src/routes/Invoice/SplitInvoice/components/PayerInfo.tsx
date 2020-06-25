import React, { useState, useEffect } from 'react';
import {
  Label,
  Col,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
} from './../../../../components';
const PayerInfo: React.FC<PayerInfoProps> = ({
  payer,
  onChange,
  invoiceValue,
  isFormInvalid
}) => {

  const { fullName, email, amountToPay } = payer;

  const [fields, setFields] = useState({
    fullName: {
      isValid: true
    },
    email: {
      isValid: true
    },
    amountToPay: {
      isValid: true
    }
  });

  const isInsertedAmountValid = amount => {
    const validation = /^(([1-9][0-9]*(\.[0-9]{1,2})?))$/;
    return validation.test(amount) && amount <= invoiceValue;
  };

  const isEmailValid = email => {
    const validation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return validation.test(email);
  }

  useEffect(() => {
    setFields({
      'amountToPay': {
        isValid: isInsertedAmountValid(amountToPay)
      },
      'fullName': {
        isValid: !!fullName
      },
      'email': {
        isValid: isEmailValid(email)
      }
    });
  }, [fullName, email, amountToPay]);

  return (
    <>
      <Col sm={4}>
        <FormGroup>
          <Label for='fullName'>
            Full Name
          </Label>
          <Input
            value={fullName}
            placeholder='Full Name'
            id='fullName'
            onChange={e => onChange('fullName', e.target.value)}
            invalid={isFormInvalid && !fields['fullName'].isValid}
          />
          <FormFeedback>
            Required
          </FormFeedback>
        </FormGroup>
      </Col>

      <Col sm={4}>
        <FormGroup>
          <Label for='email'>
            Email
          </Label>
          <Input
            value={email}
            placeholder='Email address'
            id='email'
            onChange={e => onChange('email', e.target.value)}
            invalid={isFormInvalid && !fields['email'].isValid}
          />
          <FormFeedback>
            Email address is invalid
          </FormFeedback>
        </FormGroup>
      </Col>

      <Col sm={4}>
        <FormGroup>
          <Label for='amountToPay'>
            Amount to Pay
          </Label>
          <InputGroup>
            <InputGroupAddon addonType='prepend'>
              $
            </InputGroupAddon>
            <Input
              value={amountToPay}
              placeholder='Amount to Pay'
              id='amountToPay'
              onChange={e => onChange('amountToPay', e.target.value)}
              invalid={isFormInvalid && !fields['amountToPay'].isValid}
            />
            <FormFeedback>
              Inserted amount should be a number smaller than invoice value, accepting one to two
              decimals separated by "."
            </FormFeedback>
          </InputGroup>
        </FormGroup>
      </Col>
    </>
  )
}

interface PayerInfoProps {
  payer: {
    fullName: string;
    email: string;
    amountToPay: number;
  };
  invoiceValue: number;
  isFormInvalid: boolean;
  onChange(field: string, value: string): void;
}

export default PayerInfo;
