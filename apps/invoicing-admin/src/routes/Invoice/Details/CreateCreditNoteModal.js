import React, { useState } from 'react';
import { useMutation } from 'graphql-hooks';
import numeral from 'numeral';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';

import {
  UncontrolledModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  InputGroup,
  Button,
  Col,
  Input,
} from '../../../components';

import { ButtonInput } from '../../Forms/DatePicker/components/ButtonInput';

import SuccessfulCreditNoteCreatedToast from './SuccessfulCreditNoteCreatedToast';

import { CREATE_CREDIT_NOTE_MUTATION } from '../graphql';

export default ({ target, invoiceId, invoiceItem, total }) => {
  const [recordCreditNote] = useMutation(CREATE_CREDIT_NOTE_MUTATION);
  const [creditNoteData, setCreditNoteData] = useState({
    createDraft: false,
  });

  return (
    <UncontrolledModal target={target} centered>
      <ModalHeader tag='h4'>Create Credit Note</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup row>
            <Label sm={4}>Issue Date</Label>
            <Col sm={8}>
              <InputGroup>
                <DatePicker
                  dateFormat='d MMMM yyyy'
                  customInput={<ButtonInput />}
                  selected={new Date()}
                  onChange={(date) => {
                    // setBankTransferPaymentData({
                    //   ...bankTransferPaymentData,
                    //   paymentDate: date
                    // });
                  }}
                />
              </InputGroup>
            </Col>
          </FormGroup>
          <FormGroup row>
            {invoiceItem && (
              <>
                <Label for='staticText' sm={4}>
                  Amount Value
                </Label>
                <Col sm={8}>
                  <span className='align-middle text-right h2 text-uppercase text-success font-weight-bold'>
                    {numeral(total.toFixed(2) * -1).format('$0.00')}
                  </span>
                </Col>
              </>
            )}
          </FormGroup>
          <FormGroup row>
            <Label for='staticText' sm={4}>
              Reason
            </Label>
            <Col sm={8}>
              <Input
                type='select'
                name='createDraft'
                id='draftReason'
                onChange={(e) => {
                  const { value } = e.target;
                  setCreditNoteData({
                    ...creditNoteData,
                    createDraft: !!+value,
                  });
                }}
              >
                <option value='0' selected>
                  Withdrawn Manuscript
                </option>
                <option value='1'>Reduction Applied</option>
                <option value='0'>Waived Manuscript</option>
                <option value='1'>Change Payer Details</option>
                <option value='1'>Other</option>
              </Input>
            </Col>
          </FormGroup>
        </Form>
        {/* END Form */}
      </ModalBody>
      <ModalFooter>
        <UncontrolledModal.Close color='link' className='text-primary'>
          <i className='fas fa-close mr-2'></i>
          Close
        </UncontrolledModal.Close>
        <UncontrolledModal.Close color='link' className='text-primary'>
          <Button
            color='primary'
            onClick={async (e) => {
              await recordCreditNote({
                variables: {
                  ...creditNoteData,
                  invoiceId,
                },
              });

              return toast.success(SuccessfulCreditNoteCreatedToast);
            }}
          >
            <i className='fas fa-check mr-2'></i>
            Save
          </Button>
        </UncontrolledModal.Close>
      </ModalFooter>
    </UncontrolledModal>
  );
};
