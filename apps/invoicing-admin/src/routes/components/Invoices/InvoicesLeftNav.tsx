/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import MaskedInput from 'react-text-mask';
import { useDebouncedCallback } from 'use-debounce';

import {
  Button,
  CustomInput,
  Input,
  InputGroup,
  InputGroupAddon,
  Nav,
  NavItem,
  NavLink,
} from '../../../components';
import { JournalsSelections } from './JournalsSelections';

const InvoicesLeftNav = (props) => {
  const invoiceStatus = props?.filters?.invoiceStatus || [];
  const transactionStatus = props?.filters?.transactionStatus || [];
  const journalId = props?.filters?.journalId || [];
  const referenceNumber = props?.filters?.referenceNumber || '';
  const customId = props?.filters?.customId || '';

  const [onFilterHandler] = useDebouncedCallback((eventTarget: any) => {
    const value =
      eventTarget?.type === 'checkbox'
        ? eventTarget.checked
        : eventTarget.value;
    props.setFilter(eventTarget.name, value);
  }, 300);

  return (
    <React.Fragment>
      {/* START Invoice Status */}
      <Nav accent vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='small d-flex px-1'>
            <span>Invoice Status</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            onChange={(evt) => onFilterHandler(evt.target)}
            name='invoiceStatus.DRAFT'
            checked={invoiceStatus.includes('DRAFT')}
            className='text-warning'
            type='checkbox'
            id='invoice-status-draft'
            label='Draft'
            inline
          />
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            name='invoiceStatus.ACTIVE'
            onChange={(evt) => onFilterHandler(evt.target)}
            checked={invoiceStatus.includes('ACTIVE')}
            className='text-primary'
            type='checkbox'
            id='invoice-status-active'
            label='Active'
            inline
          />
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            name='invoiceStatus.FINAL'
            onChange={(evt: any) => onFilterHandler(evt.target)}
            checked={invoiceStatus.includes('FINAL')}
            className='text-success'
            type='checkbox'
            id='invoice-status-final'
            label='Final'
            inline
          />
        </NavItem>
      </Nav>
      {/* END Invoice Status */}
      {/* START Transaction Status */}
      <Nav accent vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='small d-flex px-1'>
            <span>Transaction Status</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            onChange={(evt) => onFilterHandler(evt.target)}
            name='transactionStatus.DRAFT'
            checked={transactionStatus.includes('DRAFT')}
            className='text-warning'
            type='checkbox'
            id='checkbox1'
            label='Draft'
            inline
          />
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            onChange={(evt) => onFilterHandler(evt.target)}
            checked={transactionStatus.includes('ACTIVE')}
            name='transactionStatus.ACTIVE'
            className='text-primary'
            type='checkbox'
            id='checkbox2'
            label='Active'
            inline
          />
        </NavItem>
      </Nav>
      {/* END Transaction Status */}
      {/* START Journal Title */}
      <Nav accent vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='small d-flex px-1'>
            <span>Journal Title</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <JournalsSelections
          selected={journalId}
          onChange={(selections: any) => {
            const target = { name: 'journalTitle', value: selections };
            onFilterHandler(target);
          }}
        />
        {/* <NavItem className='d-flex p-0 form-control'>
      </NavItem> */}
      </Nav>
      {/* END Journal Title */}
      {/* START Reference Number */}
      <Nav accent vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='small d-flex px-1'>
            <span>Reference Number</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <NavItem className='d-flex p-0'>
          <InputGroup>
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
                /\d/,
              ]}
              className='form-control'
              placeholder='Enter a reference number'
              name='referenceNumber'
              type='input'
              value={referenceNumber}
              onChange={(evt: any) =>
                onFilterHandler({
                  name: 'referenceNumber',
                  value: evt.target.value,
                })
              }
              tag={MaskedInput}
              id='referenceNumber'
            />
            <InputGroupAddon addonType='append'>
              <Button
                color='secondary'
                outline
                onClick={(evt: any) => {
                  onFilterHandler({ name: 'referenceNumber', value: '' });
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
      {/* START Custom ID */}
      <Nav accent vertical className='mb-3'>
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
              onChange={(evt: any) =>
                onFilterHandler({ name: 'customId', value: evt.target.value })
              }
              className='form-control'
              placeholder='Enter a custom ID'
              id='customId'
              value={customId}
            />
            <InputGroupAddon addonType='append'>
              <Button
                color='secondary'
                outline
                onClick={(evt: any) =>
                  onFilterHandler({ name: 'customId', value: '' })
                }
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
