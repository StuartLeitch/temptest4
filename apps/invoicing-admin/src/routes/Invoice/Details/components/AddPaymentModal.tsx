import React, { useState } from 'react';
import { useMutation } from 'graphql-hooks';
import { toast } from 'react-toastify';
import SuccessfulPaymentToast from './SuccessfulPaymentToast';
import { ButtonInput } from '../../../Forms/DatePicker/components/ButtonInput';
import DatePicker from 'react-datepicker';
import { Invoice } from '../types';
import {
  Col,
  DropdownToggle,
  ModalDropdown,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  ModalBody,
} from '../../../../components';

import { BANK_TRANSFER_MUTATION } from '../../graphql';

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  invoice,
  getPaymentMethods,
  onSuccessCallback,
}) => {
  const [recordBankTransferPayment] = useMutation(BANK_TRANSFER_MUTATION);
  const [bankTransferPaymentData, setBankTransferPaymentData] = useState({
    paymentDate: new Date(),
    paymentAmount: 0,
    paymentReference: '',
  });

  const savePayment = async (markInvoiceAsPaid: boolean) => {
    await recordBankTransferPayment({
      variables: {
        invoiceId: invoice?.id,
        payerId: invoice?.payer?.id,
        paymentMethodId: getPaymentMethods.find(
          (pm) => pm.name === 'Bank Transfer'
        ).id,
        amount: parseFloat(bankTransferPaymentData.paymentAmount + ''),
        paymentReference: bankTransferPaymentData.paymentReference,
        datePaid: bankTransferPaymentData.paymentDate.toISOString(),
        markInvoiceAsPaid,
      },
    });
    onSuccessCallback();
    return toast.success(SuccessfulPaymentToast);
  };

  return (
    <ModalDropdown
      dropdownToggle={
        <DropdownToggle color='primary' caret>
          <i className='fas fa-dollar-sign mr-2'></i>
          Add Payment
        </DropdownToggle>
      }
      onSave={() => savePayment(false)}
      onSaveAndMarkInvoiceAsFinal={() => savePayment(true)}
    >
      <ModalBody>
        {/* START Form */}
        <Form>
          {/* START Payment Date Input */}
          <FormGroup row>
            <Label sm={4}>Payment Date</Label>
            <Col sm={8}>
              <InputGroup>
                <DatePicker
                  dateFormat='d MMMM yyyy'
                  customInput={<ButtonInput />}
                  selected={bankTransferPaymentData.paymentDate}
                  onChange={(date) => {
                    setBankTransferPaymentData({
                      ...bankTransferPaymentData,
                      paymentDate: date,
                    });
                  }}
                />
              </InputGroup>
            </Col>
          </FormGroup>
          {/* END Payment Date Input */}

          {/* START Amount Input */}
          <FormGroup row>
            <Label for='bothAddon' sm={4}>
              Payment Amount
            </Label>
            <Col sm={8}>
              <InputGroup>
                <InputGroupAddon addonType='prepend'>$</InputGroupAddon>
                <Input
                  placeholder='Amount...'
                  id='bothAddon'
                  onChange={(e) => {
                    const { value } = e.target;
                    setBankTransferPaymentData({
                      ...bankTransferPaymentData,
                      paymentAmount: value,
                    });
                  }}
                />
              </InputGroup>
            </Col>
          </FormGroup>
          {/* END Amount Input */}

          <FormGroup row>
            <Label for='staticText' sm={4}>
              Payment Method
            </Label>
            <Col sm={8}>
              <Input plaintext readOnly value={'Bank Transfer'} />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for='staticText' sm={4}>
              Payment Reference
            </Label>
            <Col sm={8}>
              <Input
                placeholder='Reference'
                onChange={(e) => {
                  const { value } = e.target;
                  setBankTransferPaymentData({
                    ...bankTransferPaymentData,
                    paymentReference: value,
                  });
                }}
              />
            </Col>
          </FormGroup>
        </Form>
        {/* END Form */}
      </ModalBody>
    </ModalDropdown>
  );
};

interface PaymentMethod {
  id: string;
  isActive: boolean;
  name: string;
}

interface AddPaymentModalProps {
  invoice: Invoice;
  getPaymentMethods: PaymentMethod[];
  onSuccessCallback(): void;
}

export default AddPaymentModal;
