import React from 'react';

import { Table /*, Badge */ } from '../../../components';
import { ApcType } from '../types';

const ApcList: React.FC<ApcListProps> = ({ apcItems }) => {
  return (
    <div className='table-responsive-xl'>
      <Table className='mb-0 table-striped' hover>
        <thead>
          <tr>
            <th className='align-middle bt-0'>Journal Name</th>
            <th className='align-middle bt-0'>Journal Code</th>
            <th className='align-middle bt-0'>ISSN</th>
            <th className='align-middle bt-0'>Publisher</th>
            <th className='align-middle bt-0'>APC</th>
          </tr>
        </thead>
        <tbody>
          {apcItems &&
            apcItems.map((apcItem, index) => {
              const {
                journalName,
                journalCode,
                issn,
                publisher,
                apc,
              } = apcItem;

              return (
                <tr key={index}>
                  <td className='align-middle bt-0 font-weight-bold'>
                    JOURNAL_NAME
                  </td>
                  <td className='align-middle bt-0'>'JOURNAL_CODE'</td>
                  <td className='align-middle bt-0'>'ISSN'</td>
                  <td className='align-middle bt-0'>'PUBLISHER'</td>
                  <td className='align-middle bt-0 font-weight-bold'>
                    <span className='text-linkedin pl-0 pr-2'>APC</span>
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
}

export default ApcList;
