import React from 'react';
import format from 'date-fns/format';
import { Link } from 'react-router-dom';
import { CouponType } from '../../Coupon/types';

import  { formatDate } from '../../../utils/date';
import { Table, Badge } from '../../../components';

const COUPON_STATUS = {
  ACTIVE: (
    <Badge pill color='primary'>
      Active
    </Badge>
  ),
  INACTIVE: (
    <Badge pill color='danger'>
      Inactive
    </Badge>
  ),
};

const CouponsList: React.FC<CouponsListProps> = ({ coupons }) => {
  return (
    <div className='table-responsive-xl'>
      <Table className='mb-0 table-striped' hover>
        <thead>
          <tr>
            <th className='align-middle bt-0'>Description</th>
            <th className='align-middle bt-0'>Type</th>
            <th className='align-middle bt-0'>Code</th>
            <th className='align-middle bt-0'>Reduction</th>
            <th className='align-middle bt-0'>Status</th>
            <th className='align-middle bt-0'>Redeem Count</th>
            <th className='align-middle bt-0'>Date Created</th>
            <th className='align-middle bt-0'>Date Updated</th>
            <th className='align-middle bt-0'>Expiration Date</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon, index) => {
            const {
              reduction,
              type,
              code,
              dateCreated,
              dateUpdated,
              expirationDate,
              redeemCount,
              status,
              name,
            } = coupon;

            return (
              <tr key={index}>
                <td className='align-middle bt-0'>{name}</td>
                <td className='align-middle bt-0 font-weight-bold'>{type}</td>
                <td className='align-middle bt-0 font-weight-bold'>
                  <Link
                    to={`/coupons/details/${code}`}
                    className='text-decoration-none'
                  >
                    <span className='bg-twitter text-white pl-2 pr-2'>
                      {code}
                    </span>
                  </Link>
                </td>
                <td className='align-middle bt-0 font-weight-bold'>
                  {reduction}%
                </td>
                <td className='align-middle bt-0'>{COUPON_STATUS[status]}</td>
                <td className='align-middle bt-0'>{redeemCount}</td>
                <td className='align-middle bt-0'>
                  {dateCreated && formatDate(new Date(dateCreated))}
                </td>
                <td className='align-middle bt-0'>
                  {dateUpdated && formatDate(new Date(dateUpdated))}
                </td>
                <td className='align-middle bt-0'>
                  {expirationDate &&
                    formatDate(new Date(expirationDate))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

interface CouponsListProps {
  coupons: CouponType[];
}

export default CouponsList;
