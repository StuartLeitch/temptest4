/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import useDebouncedCallback from 'use-debounce/lib/useDebouncedCallback';
import { Checkbox } from '@hindawi/phenom-ui';

import { Nav, NavItem, NavLink } from '../../../components';

const InvoicesLeftNav = (props) => {
  const invoiceStatus = props?.filters?.invoiceStatus || [];
  const transactionStatus = props?.filters?.transactionStatus || [];

  const regexRef = new RegExp(/^[0-9/_-]*$/g);

  const onFilterHandler = useDebouncedCallback((eventTarget: any) => {
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
          <NavLink href='#' className='d-flex px-1'>
            <span>Invoice Status</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            onChange={(evt) => onFilterHandler.callback(evt.target)}
            name='invoiceStatus.DRAFT'
            checked={invoiceStatus.includes('DRAFT')}
            className='text-warning'
            id='invoice-status-draft'
          >
            Draft
          </Checkbox>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            name='invoiceStatus.ACTIVE'
            onChange={(evt) => onFilterHandler.callback(evt.target)}
            checked={invoiceStatus.includes('ACTIVE')}
            className='text-primary'
            id='invoice-status-active'
          >
            Active
          </Checkbox>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            name='invoiceStatus.FINAL'
            onChange={(evt: any) => onFilterHandler.callback(evt.target)}
            checked={invoiceStatus.includes('FINAL')}
            className='text-success'
            id='invoice-status-final'
          >
            Final
          </Checkbox>
        </NavItem>
      </Nav>
      {/* END Invoice Status */}
      {/* START Transaction Status */}
      <Nav accent vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='d-flex px-1'>
            <span>Transaction Status</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            onChange={(evt) => onFilterHandler.callback(evt.target)}
            name='transactionStatus.DRAFT'
            checked={transactionStatus.includes('DRAFT')}
            className='text-warning'
            id='checkbox1'
          >
            Draft
          </Checkbox>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            onChange={(evt) => onFilterHandler.callback(evt.target)}
            checked={transactionStatus.includes('ACTIVE')}
            name='transactionStatus.ACTIVE'
            className='text-primary'
            id='checkbox2'
          >
            Active
          </Checkbox>
        </NavItem>
      </Nav>
    </React.Fragment>
  );
};

export { InvoicesLeftNav };
