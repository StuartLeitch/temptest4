import React from 'react';

import { Card, Table, Col, CardFooter } from '../../../components';

const CouponsList = () => {
  return (
    <Card className='mb-0'>
      <div className='table-responsive-xl'>
        <Table className='mb-0 table-striped' hover>
          <thead>
            <tr>
              <th className='align-middle bt-0'>Coupon Type</th>
              <th className='align-middle bt-0'>Code</th>
              <th className='align-middle bt-0'>Status</th>
              <th className='align-middle bt-0'>Redeem Count</th>
              <th className='align-middle bt-0'>Invoice Item Type</th>
              <th className='align-middle bt-0'>Date Created</th>
              <th className='align-middle bt-0'>Date Updated</th>
              <th className='align-middle bt-0'>Name</th>
            </tr>
          </thead>
          <tbody>
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
