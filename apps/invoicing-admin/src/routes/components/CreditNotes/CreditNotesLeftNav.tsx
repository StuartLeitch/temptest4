/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import useDebouncedCallback from "use-debounce/lib/useDebouncedCallback";

import {
  // Button,
  CustomInput,
  // Input,
  // InputGroup,
  // InputGroupAddon,
  Nav,
  NavItem,
  NavLink,
} from '../../../components';

const CreditNotesLeftNav = (props) => {
  const reason = props?.filters?.reason || [];
  // const transactionStatus = props?.filters?.transactionStatus || [];
  // const journalId = props?.filters?.journalId || [];
  // const referenceNumber = props?.filters?.referenceNumber || '';
  // const customId = props?.filters?.customId || '';
  const regexRef = new RegExp(/^[0-9/_-]*$/g)

  const onFilterHandler = useDebouncedCallback((eventTarget: any) => {
    const value =
      eventTarget?.type === 'checkbox'
        ? eventTarget.checked
        : eventTarget.value;
      props.setFilter(eventTarget.name, value);
  }, 300);

  const referenceFilter = (eventTarget: any) => {
    const value = eventTarget.value;
    const validatedValue = regexRef.test(value) ? value : eventTarget.preventDefault()
    props.setFilter(eventTarget.name, validatedValue)
  };

  return (
    <React.Fragment>
      {/* START Reason */}
      <Nav accent vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='d-flex px-1'>
            <span>Reason</span>
            <i className='fas fa-angle-down align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            onChange={(evt) => onFilterHandler.callback(evt.target)}
            name='reason.WITHDRAWN_MANUSCRIPT'
            checked={reason.includes('WITHDRAWN_MANUSCRIPT')}
            className='text-info'
            type='checkbox'
            id='creditnote-reason-withdrawn-manuscript'
            label='Withdrawn Manuscript'
            inline
          />
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            name='reason.REDUCTION_APPLIED'
            onChange={(evt) => onFilterHandler.callback(evt.target)}
            checked={reason.includes('REDUCTION_APPLIED')}
            className='text-info'
            type='checkbox'
            id='creditnote-reason-reduction-applied'
            label='Reduction Applied'
            inline
          />
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            name='reason.WAIVED_MANUSCRIPT'
            onChange={(evt: any) => onFilterHandler.callback(evt.target)}
            checked={reason.includes('WAIVED_MANUSCRIPT')}
            className='text-info'
            type='checkbox'
            id='creditnote-reason-waived-manuscript'
            label='Waived Manuscript'
            inline
          />
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            name='reason.CHANGED_PAYER_DETAILS'
            onChange={(evt: any) => onFilterHandler.callback(evt.target)}
            checked={reason.includes('CHANGED_PAYER_DETAILS')}
            className='text-info'
            type='checkbox'
            id='creditnote-reason-change-payer-details'
            label='Change Payer Details'
            inline
          />
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            name='reason.BAD_DEBT'
            onChange={(evt: any) => onFilterHandler.callback(evt.target)}
            checked={reason.includes('BAD_DEBT')}
            className='text-info'
            type='checkbox'
            id='creditnote-reason-bad-debt'
            label='Bad Debt'
            inline
          />
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <CustomInput
            name='reason.OTHER'
            onChange={(evt: any) => onFilterHandler.callback(evt.target)}
            checked={reason.includes('OTHER')}
            className='text-info'
            type='checkbox'
            id='creditnote-reason-other'
            label='Other Reason'
            inline
          />
        </NavItem>
      </Nav>
      {/* END Reason */}
    </React.Fragment>
  );
};

export { CreditNotesLeftNav };
