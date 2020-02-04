import React, { useState } from 'react';
import faker from 'faker/locale/en_US';
import useDebouncedEffect from 'use-debounced-effect';
import MaskedInput from 'react-text-mask';

import {
  Button,
  CustomInput,
  Input,
  InputGroup,
  InputGroupAddon,
  Nav,
  NavItem,
  NavLink
} from '../../../components';
import { JournalsSelections } from '../Invoices/JournalsSelections';

const InvoicesLeftNav = props => {
  const [eventTarget, onFilterHandler] = useState('');

  useDebouncedEffect(
    () => {
      // * debounced 300 millisecs
      const value =
        eventTarget?.type === 'checkbox'
          ? eventTarget.checked
          : eventTarget.value;
      props.setFilter({ [eventTarget.name]: value });
    },
    300,
    [eventTarget]
  );

  return (
    <React.Fragment>
      {/* START Invoice Status */}
      <Nav vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='small d-flex px-1'>
            <span>Invoice Status</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            onChange={evt => onFilterHandler(evt.target)}
            name='invoiceStatus.DRAFT'
            className='text-warning'
            type='checkbox'
            id='invoice-status-draft'
            label='Draft'
            inline
          />
          {/* <span className='small ml-auto align-self-center'>
            ({faker.finance.mask()})
          </span> */}
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            name='invoiceStatus.ACTIVE'
            onChange={evt => onFilterHandler(evt.target)}
            className='text-primary'
            type='checkbox'
            id='invoice-status-active'
            label='Active'
            inline
          />
          {/* <span className='small ml-auto align-self-center'>
            ({faker.finance.mask()})
          </span> */}
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            name='invoiceStatus.FINAL'
            onChange={evt => onFilterHandler(evt.target)}
            className='text-success'
            type='checkbox'
            id='invoice-status-final'
            label='Final'
            inline
          />
          {/* <span className='small ml-auto align-self-center'>
            ({faker.finance.mask()})
          </span> */}
        </NavItem>
      </Nav>
      {/* END Invoice Status */}
      {/* START Transaction Status */}
      <Nav vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='small d-flex px-1'>
            <span>Transaction Status</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            onChange={evt => onFilterHandler(evt.target)}
            name='transactionStatus.DRAFT'
            className='text-warning'
            type='checkbox'
            id='checkbox1'
            label='Draft'
            inline
          />
          {/* <span className='small ml-auto align-self-center'>
            ({faker.finance.mask()})
          </span> */}
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            onChange={evt => onFilterHandler(evt.target)}
            name='transactionStatus.ACTIVE'
            className='text-primary'
            type='checkbox'
            id='checkbox2'
            label='Active'
            inline
          />
          {/* <span className='small ml-auto align-self-center'>
            ({faker.finance.mask()})
          </span> */}
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            onChange={evt => onFilterHandler(evt.target)}
            name='transactionStatus.FINAL'
            className='text-success'
            type='checkbox'
            id='checkbox3'
            label='Final'
            inline
          />
          {/* <span className='small ml-auto align-self-center'>
            ({faker.finance.mask()})
          </span> */}
        </NavItem>
      </Nav>
      {/* END Transaction Status */}
      {/* START Journal Title */}
      <Nav vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='small d-flex px-1'>
            <span>Journal Title</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <JournalsSelections
          onChange={selections => {
            const target = { name: 'journalTitle', value: selections };
            onFilterHandler(target);
          }}
        />
        {/* <NavItem className='d-flex p-0 form-control'>
      </NavItem> */}
      </Nav>
      {/* END Journal Title */}
      {/* START Reference Number */}
      <Nav vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='small d-flex px-1'>
            <span>Reference Number</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <NavItem className='d-flex p-0'>
          <Input
            mask={[
              /[0-9]/,
              /\d/,
              /\d/,
              /\d/,
              /\d/,
              '/',
              /1|2/,
              /0|9/,
              /\d/,
              /\d/
            ]}
            className='form-control'
            placeholder='Enter a reference number'
            name='referenceNumber'
            type='input'
            onChange={evt => onFilterHandler(evt.target)}
            tag={MaskedInput}
            id='refNumber'
          />
          <InputGroupAddon addonType='append'>
            <Button
              color='secondary'
              outline
              onClick={evt => {
                const newValue = '';
                document.getElementById('refNumber').value = newValue;
                const target = { name: 'refNumber', value: newValue };
                onFilterHandler(target);
              }}
            >
              <i className='fa fa-times mr-2'></i>
              Clear
            </Button>
          </InputGroupAddon>
        </NavItem>
      </Nav>
      {/* END Reference Number */}
      {/* START Custom ID */}
      <Nav vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='small d-flex px-1'>
            <span>Custom ID</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <NavItem className='d-flex p-0'>
          <InputGroup>
            <Input
              name='customId'
              onChange={evt => onFilterHandler(evt.target)}
              className='form-control'
              placeholder='Enter a custom ID'
              id='customId'
            />
            <InputGroupAddon addonType='append'>
              <Button
                color='secondary'
                outline
                onClick={evt => {
                  const newValue = '';
                  document.getElementById('customId').value = newValue;
                  const target = { name: 'customId', value: newValue };
                  onFilterHandler(target);
                }}
              >
                <i className='fa fa-times mr-2'></i>
                Clear
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </NavItem>
      </Nav>
      {/* END Reference Number */}
    </React.Fragment>
  );
};

export { InvoicesLeftNav };
