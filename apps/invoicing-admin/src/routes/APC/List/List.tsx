import React, { useState } from 'react';

import { Table } from '../../../components';
import { ApcType, PublisherType } from '../types';

const ApcList: React.FC<ApcListProps> = ({ apcItems, publisherItems }) => {
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
            apcItems.map((apcItem, apcIndex) => {
              const { journalTitle, issn, amount } = apcItem;

              return (
                <tr key={apcIndex}>
                  <td className='align-middle bt-0'>{journalTitle}</td>
                  <td className='align-middle bt-0'>{''}</td>
                  <td className='align-middle bt-0'>{issn}</td>
                  <td className='align-middle bt-0'> </td>
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
  apcItems: ApcType[];
  publisherItems: PublisherType[];
}

export default ApcList;
