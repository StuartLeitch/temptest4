import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from 'graphql-hooks';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';

import { HeaderMain } from '../components/HeaderMain';

import ErrorToast from './components/ErrorToast';
import Toolbar from './components/Toolbar';

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
} from '../../components';

import CouponCreate from './components/CouponCreate';

import { COUPON_CREATE_MUTATION } from './graphql';

import { CouponCreateContext, couponCreateInitialState } from './Context';

import { CREATE } from './config';

const ViewEditContainer: React.FC = () => {
  const history = useHistory();
  const [saveInProgress, setSaveInProgress] = useState(false);

  const [createCoupon] = useMutation(COUPON_CREATE_MUTATION);

  const [couponState, setCouponState] = useState(couponCreateInitialState);
  const couponProviderValue = {
    couponState,
    update: (field, newValue) =>
      setCouponState((state) => ({ ...state, [field]: newValue })),
  };

  const saveCoupon = async () => {
    setSaveInProgress(true);

    const fieldsAndTheirValue = {};
    Object.keys(couponState).forEach((field) => {
      const fieldValue = couponState[field].value;

      if (fieldValue === null) return;

      if (field === 'reduction') {
        fieldsAndTheirValue[field] = parseFloat(fieldValue);
        return;
      }

      fieldsAndTheirValue[field] = fieldValue;
    });

    try {
      const createCouponResult = await createCoupon({
        variables: {
          coupon: { ...fieldsAndTheirValue, invoiceItemType: 'APC' },
        },
      });

      const createError = (createCouponResult?.error?.graphQLErrors[0] as any)
        ?.message;

      if (!createError) {
        history.push('/coupons/list');
      } else {
        const Error = (props) => (
          <ErrorToast {...{ ...props, error: createError }} />
        );
        toast.error(Error);
      }
    } catch (e) {
      toast.error(ErrorToast);
    }

    setSaveInProgress(false);
  };

  const cancelCreate = () => {
    history.push('/coupons/list');
  };

  return (
    <Container fluid={true} className='mb-5'>
      <Link
        to={`/coupons/list`}
        className='text-decoration-none d-block mb-4 mt-0'
      >
        <i className='fas fa-angle-left mr-2' /> Back to coupons list
      </Link>
      <HeaderMain title='Create Coupon' className='mb-3 mt-0' />
      <Row>
        <Col lg={8}>
          <Card>
            <CouponCreateContext.Provider value={couponProviderValue}>
              <CardHeader className='mb-3 d-flex align-items-center'>
                <h5 className='mb-0'>Details</h5>
                <Toolbar
                  mode={CREATE}
                  onSave={saveCoupon}
                  isSaveInProgress={saveInProgress}
                  onCancel={cancelCreate}
                />
              </CardHeader>
              <CardBody>
                <CouponCreate />
              </CardBody>
            </CouponCreateContext.Provider>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewEditContainer;
