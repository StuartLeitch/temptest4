import React from 'react';
// import faker from 'faker/locale/en_US';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import {
  Badge,
  // Progress,
  Avatar,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from '../../../../components';
import { randomAvatar } from '../../../../utilities';

/*eslint-disable */
const INVOICE_STATUS = {
  FINAL: (
    <Badge pill color='success'>
      Final
    </Badge>
  ),
  ACTIVE: (
    <Badge pill color='primary'>
      Active
    </Badge>
  ),
  DRAFT: (
    <Badge pill color='secondary'>
      Draft
    </Badge>
  )
};

const TrTableInvoicesList = ({ invoices }) => (
  <React.Fragment>
    {invoices.map(
      ({
        id,
        status, // customId,
        manuscriptTitle,
        type,
        price,
        dateCreated
      }) => (
        <tr key={id}>
          <td className='align-middle'>{INVOICE_STATUS[status]}</td>
          <td className='align-middle'>
            <div>
              <Link to='/apps/tasks/list' className='text-decoration-none'>
                {manuscriptTitle}
              </Link>
            </div>
          </td>
          <td className='align-middle'>
            <span>{type}</span>
          </td>
          <td className='align-middle'>
            <strong>$</strong>
            {price}
          </td>
          <td className='align-middle text-nowrap'>
            {new Intl.DateTimeFormat('en-GB', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: false,
              timeZone: 'Europe/London'
            }).format(dateCreated)}
          </td>
          <td className='align-middle'>
            <Avatar.Image size='md' src={randomAvatar()} />
          </td>
          <td className='align-middle text-right'>
            <UncontrolledButtonDropdown>
              <DropdownToggle color='link' outline>
                <i className='fa fa-gear' />
                <i className='fa fa-angle-down ml-2' />
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  <i className='fa fa-fw fa-folder-open mr-2'></i>
                  Accept Manuscript
                </DropdownItem>
                {/* <DropdownItem>
                <i className='fa fa-fw fa-ticket mr-2'></i>
                Add Task
              </DropdownItem>
              <DropdownItem>
                <i className='fa fa-fw fa-paperclip mr-2'></i>
                Add Files
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem>
                <i className='fa fa-fw fa-trash mr-2'></i>
                Delete
              </DropdownItem> */}
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          </td>
        </tr>
      )
    )}
  </React.Fragment>
);

export { TrTableInvoicesList };
