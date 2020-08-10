import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'graphql-hooks';
import { toast } from 'react-toastify';

import { HeaderMain } from '../components/HeaderMain';
import { Loading } from '../components';

import ErrorToast from './components/ErrorToast';
import Toolbar from './components/Toolbar';

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Error,
} from '../../components';

import CouponViewEdit from './components/CouponViewEdit';

import { COUPON_QUERY, COUPON_UPDATE_MUTATION } from './graphql';

import { CouponEditContext, couponEditInitialState } from './Context';

import { VIEW, EDIT } from './config';

const Content = ({ loading, data, error, mode }) => {
  if (loading) return <Loading />;

  if (error) return <Error error={error} />;

  if (data) return <CouponViewEdit coupon={data.coupon} mode={mode} />;

  return <Loading />;
};

const ViewEditContainer: React.FC = () => {
  const { code } = useParams();
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [mode, setMode] = useState(VIEW);

  const [updateCoupon] = useMutation(COUPON_UPDATE_MUTATION);
  const { loading, error, data, refetch: couponQueryRefetch } = useQuery(
    COUPON_QUERY,
    {
      variables: { couponCode: code },
    }
  );

  const [couponState, setCouponState] = useState(couponEditInitialState);
  const couponProviderValue = {
    couponState,
    update: (field, newValue) =>
      setCouponState((state) => ({ ...state, [field]: newValue })),
  };

  const saveEditedCoupon = async () => {
    const updateFields = [
      'type',
      'name',
      'reduction',
      'status',
      'expirationDate',
    ];

    const fieldsToUpdate = {};
    updateFields.forEach((field) => {
      const currentFieldValue = couponState[field].value;
      if (currentFieldValue !== data.coupon[field]) {
        if (field === 'reduction') {
          fieldsToUpdate[field] = parseFloat(currentFieldValue);
          return;
        }

        fieldsToUpdate[field] = currentFieldValue;
      }
    });

    // if coupon is changed to MULTIPLE_USE, also add expiration date
    if (
      Object.values(fieldsToUpdate).some((value) => value === 'MULTIPLE_USE') &&
      !fieldsToUpdate['expirationDate']
    ) {
      fieldsToUpdate['expirationDate'] = data.coupon.expirationDate;
    }

    try {
      const updateCouponResult = await updateCoupon({
        variables: { coupon: { id: data.coupon.id, ...fieldsToUpdate } },
      });

      const updateError = (updateCouponResult?.error?.graphQLErrors[0] as any)
        ?.message;

      if (!updateError) {
        couponQueryRefetch();
        setMode('VIEW');
      } else {
        const Error = (props) => (
          <ErrorToast {...{ ...props, error: updateError }} />
        );
        toast.error(Error);
      }
    } catch (e) {
      toast.error(ErrorToast);
    }

    setUpdateInProgress(false);
  };

  const cancelEdit = () => {
    setMode('VIEW');
    const { name, type, reduction, status, expirationDate } = data.coupon;

    setCouponState({
      ...couponState,
      name: { value: name, isValid: true },
      type: { value: type, isValid: true },
      reduction: { value: reduction, isValid: true },
      status: { value: status, isValid: true },
      expirationDate: { value: expirationDate, isValid: true },
    });
  };

  return (
    <Container fluid={true} className='mb-5'>
      <Link
        to={`/coupons/list`}
        className='text-decoration-none d-block mb-4 mt-0'
      >
        <i className='fas fa-angle-left mr-2' /> Back to coupons list
      </Link>
      <HeaderMain title={`Coupon #${code}`} className='mb-3 mt-0' />
      <Row>
        <Col lg={8}>
          <Card>
            <CouponEditContext.Provider value={couponProviderValue}>
              <CardHeader className='mb-3 d-flex align-items-center'>
                <h5 className='mb-0'>Details</h5>
                <Toolbar
                  onSave={saveEditedCoupon}
                  onCancel={cancelEdit}
                  onEdit={() => setMode(EDIT)}
                  isSaveInProgress={updateInProgress}
                  mode={mode}
                />
              </CardHeader>
              <CardBody>
                <Content {...{ loading, data, error, mode }} />
              </CardBody>
            </CouponEditContext.Provider>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewEditContainer;
