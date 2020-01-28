import React from 'react';
// import faker from 'faker/locale/en_US';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';

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
        status,
        referenceNumber,
        customId,
        manuscriptTitle,
        type,
        price,
        dateIssued,
        dateCreated,
        journalTitle
      }) => (
        <tr key={id}>
          <td className='align-middle'>
            <div>
              <Link
                to={`/invoices/details/${id}`}
                className='text-decoration-none'
              >
                {id}
              </Link>
            </div>
          </td>
          <td className='align-middle'>{INVOICE_STATUS[status]}</td>
          <td className='align-middle'>
            <span>#{referenceNumber}</span>
          </td>
          <td className='align-middle text-nowrap'>
            {dateIssued &&
              format(new Date(parseInt(dateIssued, 10)), 'dd MMMM yyyy')}
          </td>
          <td className='align-middle'>
            <strong>$</strong>
            {price}
          </td>
          <td className='align-middle text-nowrap'>{journalTitle}</td>
          <td className='align-middle'>
            <span>#{customId}</span>
          </td>
          <td className='align-middle'>{manuscriptTitle}</td>
          <td className='align-middle text-nowrap'>
            {dateCreated &&
              format(new Date(parseInt(dateCreated, 10)), 'dd MMMM yyyy')}
          </td>
          {/* <td className='align-middle text-right'>
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
                <DropdownItem>
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
              </DropdownItem>
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          </td> */}
        </tr>
      )
    )}
  </React.Fragment>
);

export { TrTableInvoicesList };
