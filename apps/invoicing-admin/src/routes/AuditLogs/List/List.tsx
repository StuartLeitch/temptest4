import React from 'react';
import format from 'date-fns/format';
import { Link } from 'react-router-dom';

// import  { formatDateWithMinutes } from '../../../utils/date';
import { Table/*, Badge */} from '../../../components';
import { AuditLogType } from '../types';

// const COUPON_STATUS = {
//   ACTIVE: (
//     <Badge pill color='primary'>
//       Active
//     </Badge>
//   ),
//   INACTIVE: (
//     <Badge pill color='danger'>
//       Inactive
//     </Badge>
//   ),
// };

const AuditLogsList: React.FC<AuditLogsListProps> = ({ logs }) => {
  return (
    <div className='table-responsive-xl'>
      <Table className='mb-0 table-striped' hover>
        <thead>
          <tr>
            <th className='align-middle bt-0'>Timestamp</th>
            <th className='align-middle bt-0'>User Account</th>
            <th className='align-middle bt-0'>Action</th>
            <th className='align-middle bt-0'>Entity</th>
          </tr>
        </thead>
        <tbody>
          {logs && logs.map((log, index) => {
            const {
              id,
              userAccount,
              action,
              entity,
              timestamp
            } = log;

            return (
              <tr key={index}>
                <td className='align-middle bt-0 font-weight-bold'>
                    <span className='bg-twitter text-white pl-2 pr-2'>{timestamp && format(new Date(timestamp), 'dd MMM yyyy HH:mm')}</span>
                </td>
                <td className='align-middle bt-0 font-weight-bold'>{userAccount}</td>
                <td className='align-middle bt-0'>
                  {action}
                </td>
                <td className='align-middle bt-0'>{entity}</td>
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
