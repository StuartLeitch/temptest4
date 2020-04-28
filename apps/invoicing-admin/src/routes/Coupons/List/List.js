import React from 'react';
import format from 'date-fns/format';

import { Card, Table, CardFooter, Badge } from '../../../components';

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

const CouponsList = ({ coupons }) => {
  return (
    <Card className='mb-0'>
      <div className='table-responsive-xl'>
        <Table className='mb-0 table-striped' hover>
          <thead>
            <tr>
              <th className='align-middle bt-0'>Name</th>
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
            {coupons.map((coupon) => {
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
                <tr>
                  <td className='align-middle bt-0'>{name}</td>
                  <td className='align-middle bt-0'>{type}</td>
                  <td className='align-middle bt-0 font-weight-bold'>{code}</td>
                  <td className='align-middle bt-0'>{reduction}</td>
                  <td className='align-middle bt-0'>{COUPON_STATUS[status]}</td>
                  <td className='align-middle bt-0'>{redeemCount}</td>
                  <td className='align-middle bt-0'>
                    {dateCreated &&
                      format(new Date(dateCreated), 'dd MMMM yyyy')}
                  </td>
                  <td className='align-middle bt-0'>
                    {dateUpdated &&
                      format(new Date(dateUpdated), 'dd MMMM yyyy')}
                  </td>
                  <td className='align-middle bt-0'>
                    {expirationDate &&
                      format(new Date(expirationDate), 'dd MMMM yyyy')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      <CardFooter className='d-flex justify-content-center pb-0'>
        {/* <ListPagination
          totalRecords={data?.invoices?.totalCount}
          pageNeighbours={1}
          onPageChanged={onPageChanged}
          pageLimit={pagination.limit}
          currentPage={pagination.offset + 1}
        /> */}
      </CardFooter>
    </Card>
  );
};

export default CouponsList;
