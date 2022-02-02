import React, { useState } from 'react';

import {
  Table,
  Button,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  Input,
  UncontrolledButtonDropdown,
  DropdownItem,
} from '../../../components';
import { ApcType, PublisherType } from '../types';

const ApcList: React.FC<ApcListProps> = ({ apcItems, publisherNames }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className='table-responsive-xl'>
      <Table className='mb-0 table-striped' hover>
        <thead>
          <tr>
            <th className='align-middle bt-0 font-weight-bold'>Journal Name</th>
            <th className='align-middle bt-0 font-weight-bold'>Journal Code</th>
            <th className='align-middle bt-0 font-weight-bold'>ISSN</th>
            <th className='align-middle bt-0 font-weight-bold'>Publisher</th>
            <th className='align-middle bt-0 font-weight-bold'>APC</th>
          </tr>
        </thead>
        <tbody>
          {apcItems &&
            apcItems.map((apcItem, index) => {
              const {
                journalTitle,
                journalId,
                issn,
                publisherId,
                amount,
              } = apcItem;

              return (
                <tr key={index}>
                  <td className='align-middle bt-0'>{journalTitle}</td>
                  <td className='align-middle bt-0'>{journalId}</td>
                  <td className='align-middle bt-0'>{issn}</td>
                  <td className='align-middle bt-0'>{publisherId}</td>
                  <td className='align-middle bt-0'>
                    <span className='text-green pl-0 pr-2'>${amount}</span>
                    {/* condition to make buttons appear if editMode is true value changed */}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    </div>
  );
};

interface ApcListProps {
  apcItems: any;
  publisherNames: any;
}

export default ApcList;
