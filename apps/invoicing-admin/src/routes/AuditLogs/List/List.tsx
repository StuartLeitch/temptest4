import React from 'react';

import  { formatDate } from '../../../utils/date';
import { Table/*, Badge */} from '../../../components';
import { AuditLogType } from '../types';

const AuditLogsList: React.FC<AuditLogsListProps> = ({ logs }) => {
  return (
    <div className='table-responsive-xl'>
      <Table className='mb-0 table-striped' hover>
        <thead>
          <tr>
            <th className='align-middle bt-0'>User Account</th>
            <th className='align-middle bt-0'>Timestamp</th>
            <th className='align-middle bt-0'>Action</th>
            <th className='align-middle bt-0'>Entity</th>
            <th className='align-middle bt-0'>Item Reference</th>
            <th className='align-middle bt-0'>Target Reference</th>
          </tr>
        </thead>
        <tbody>
          {logs && logs.map((log, index) => {
            const {
              userAccount,
              action,
              entity,
              timestamp,
              item_reference,
              target
            } = log;

            return (
              <tr key={index}>
                <td className='align-middle bt-0 font-weight-bold'>{userAccount}</td>
                <td className='align-middle bt-0 font-weight-bold'>
                  {timestamp && formatDate(new Date(timestamp))}
                </td>
                <td className='align-middle bt-0'>
                  {action}
                </td>
                <td className='align-middle bt-0'>{entity}</td>
                <td className='align-middle bt-0 font-weight-bold'>
                  <span className='text-linkedin pl-0 pr-2'>{item_reference}</span>
                </td>
                <td className='align-middle bt-0'>{target}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

interface AuditLogsListProps {
  logs: AuditLogType[];
}

export default AuditLogsList;
