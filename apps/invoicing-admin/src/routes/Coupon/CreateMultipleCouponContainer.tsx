import { useNavigate, Link } from 'react-router-dom';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { HeaderMain } from '../components/HeaderMain';

import Toolbar from './components/Toolbar';

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
} from '../../components';

import MultipleCouponCreate from './components/MultipleCouponCreate';

import {
  MultipleCouponCreateContext,
  multipleCouponInitialState,
} from './Context';

import { CREATE_MULTIPLE } from './config';
import { useAuth } from '../../contexts/Auth';
import axios, { AxiosError } from 'axios';
import ErrorToast from './components/ErrorToast';

const CreateMultipleCouponContainer: React.FC = () => {
  const auth = useAuth();
  const { token } = auth.data;
  const navigate = useNavigate();
  const [saveInProgress, setSaveInProgress] = useState(false);

  const [multipleCouponState, setMultipleCouponState] = useState(
    multipleCouponInitialState
  );
  const multipleCouponProvider = {
    multipleCouponState,
    update: (field, newValue) =>
      setMultipleCouponState((state) => ({ ...state, [field]: newValue })),
  };

  const saveCoupon = async () => {
    setSaveInProgress(true);
    const url = `${(window as any)._env_.API_ROOT}/coupons/multiple`;
    const fmData = new FormData();
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    };

    fmData.append('name', multipleCouponState.name.value);
    fmData.append('status', multipleCouponState.status.value);
    fmData.append('expirationDate', multipleCouponState.expirationDate.value);
    fmData.append('reduction', multipleCouponState.reduction.value);
    fmData.append('file', multipleCouponState.inputFile.value);

    try {
      const response = await axios.post(url, fmData, config);
      const downwloadUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      );
      const link = document.createElement('a');
      link.setAttribute('download', 'coupons.csv');
      link.setAttribute('href', downwloadUrl);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      navigate('/coupons/list');
    } catch (error) {
      const err = error as AxiosError;
      console.info('Error: ', err.response.data);
      const Error = (props) => (
        <ErrorToast {...{ ...props, error: err.response.data }} />
      );
      toast.error(Error);
    }
    setSaveInProgress(false);
  };

  const cancelCreate = () => {
    navigate('/coupons/list');
  };

  return (
    <Container fluid={true} className='mb-5'>
      <Link
        to={`/coupons/list`}
        className='text-decoration-none d-block mb-4 mt-0'
      >
        <i className='fas fa-angle-left mr-2' /> Back to coupons list
      </Link>
      <HeaderMain title='Create Multiple Coupons' className='mb-3 mt-0' />
      <Row>
        <Col lg={8}>
          <Card>
            <MultipleCouponCreateContext.Provider
              value={multipleCouponProvider}
            >
              <CardHeader className='mb-3 d-flex align-items-center'>
                <h5 className='mb-0'>Details</h5>
                <Toolbar
                  mode={CREATE_MULTIPLE}
                  onSave={saveCoupon}
                  isSaveInProgress={saveInProgress}
                  onCancel={cancelCreate}
                />
              </CardHeader>
              <CardBody>
                <MultipleCouponCreate />
              </CardBody>
            </MultipleCouponCreateContext.Provider>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateMultipleCouponContainer;
