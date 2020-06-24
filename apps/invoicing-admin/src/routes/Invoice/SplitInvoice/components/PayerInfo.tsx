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
  invoiceValue
}) => {

  const { fullName, email, amountToPay } = payer;

  const [fields, setFields] = useState({
    fullName: {
      isTouched: false,
      isValid: true
    },
    email: {
      isTouched: false,
      isValid: true
    },
    amountToPay: {
      isTouched: false,
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
        isTouched: fields.amountToPay.isTouched,
        isValid: isInsertedAmountValid(amountToPay)
      },
      'fullName': {
        isTouched: fields.fullName.isTouched,
        isValid: !!fullName
      },
      'email': {
        isTouched: fields.email.isTouched,
        isValid: isEmailValid(email)
      }
    });
  }, [fullName, email, amountToPay]);

  const handleChange = (field: string, value: string) => {
    setFields({...fields, [field]: {
      ...fields[field],
      isTouched: true
    }});
    onChange(field, value);
  };

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
            onChange={e => handleChange('fullName', e.target.value)}
            invalid={fields['fullName'].isTouched && !fields['fullName'].isValid}
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
            onChange={e => handleChange('email', e.target.value)}
            invalid={fields['email'].isTouched && !fields['email'].isValid}
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
              onChange={e => handleChange('amountToPay', e.target.value)}
              invalid={fields['amountToPay'].isTouched && !fields['amountToPay'].isValid}
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
  onChange(field: string, value: string): void;
}

export default PayerInfo;
