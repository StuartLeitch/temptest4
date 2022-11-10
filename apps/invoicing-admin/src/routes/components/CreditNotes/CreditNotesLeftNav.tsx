/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import useDebouncedCallback from 'use-debounce/lib/useDebouncedCallback';
import { Checkbox } from '@hindawi/phenom-ui';

import { Nav, NavItem, NavLink } from '../../../components';

const CreditNotesLeftNav = (props) => {
  const reason = props?.filters?.reason || [];

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
      {/* START Reason */}
      <Nav accent vertical className='mb-3'>
        <NavItem className='mb-2'>
          <NavLink href='#' className='d-flex px-1'>
            <span>Reason</span>
            <i className='fas align-self-center ml-auto'></i>
          </NavLink>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            onChange={(evt) => onFilterHandler.callback(evt.target)}
            name='reason.WITHDRAWN_MANUSCRIPT'
            checked={reason.includes('WITHDRAWN_MANUSCRIPT')}
            id='creditnote-reason-withdrawn-manuscript'
          >
            Withdrawn Manuscript
          </Checkbox>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            name='reason.REDUCTION_APPLIED'
            onChange={(evt) => onFilterHandler.callback(evt.target)}
            checked={reason.includes('REDUCTION_APPLIED')}
            id='creditnote-reason-reduction-applied'
          >
            Reduction Applied
          </Checkbox>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            name='reason.WAIVED_MANUSCRIPT'
            onChange={(evt: any) => onFilterHandler.callback(evt.target)}
            checked={reason.includes('WAIVED_MANUSCRIPT')}
            id='creditnote-reason-waived-manuscript'
          >
            Waived Manuscript
          </Checkbox>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            name='reason.CHANGE_PAYER_DETAILS'
            onChange={(evt: any) => onFilterHandler.callback(evt.target)}
            checked={reason.includes('CHANGE_PAYER_DETAILS')}
            id='creditnote-reason-change-payer-details'
          >
            Change Payer Details
          </Checkbox>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            name='reason.BAD_DEBT'
            onChange={(evt: any) => onFilterHandler.callback(evt.target)}
            checked={reason.includes('BAD_DEBT')}
            id='creditnote-reason-bad-debt'
          >
            Bad Debt
          </Checkbox>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            name='reason.OTHER'
            onChange={(evt: any) => onFilterHandler.callback(evt.target)}
            checked={reason.includes('OTHER')}
            id='creditnote-reason-other'
          >
            Other
          </Checkbox>
        </NavItem>
        <NavItem className='d-flex px-2 mb-2'>
          <Checkbox
            name='reason.TA_LATE_APPROVAL'
            onChange={(evt: any) => onFilterHandler.callback(evt.target)}
            checked={reason.includes('TA_LATE_APPROVAL')}
            id='creditnote-reason-ta-late-approval'
          >
            TA Late Approval
          </Checkbox>
        </NavItem>
      </Nav>
      {/* END Reason */}
    </React.Fragment>
  );
};

export { CreditNotesLeftNav };
