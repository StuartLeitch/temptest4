import React from 'react';
import { Link } from 'react-router-dom';

import {
  Card,
  CardBody,
  CardTitle,
  Container,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  CustomInput,
  Button,
  Label
} from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';

// import { HeaderAuth } from '../../components/Pages/HeaderAuth';
// import { FooterAuth } from '../../components/Pages/FooterAuth';
// import { TimelineMini } from '../../components/Timeline/TimelineMini';
// import { TimelineDefault } from '../../components/Timeline/TimelineDefault';

import { DlRowBilledTo } from '../../components/Invoice/DlRowBilledTo';
import { DlRowCharges } from '../../components/Invoice/DlRowCharges';
import { DlRowArticleDetails } from '../../components/Invoice/DlRowArticleDetails';
import { DlRowPaymentOptions } from '../../components/Invoice/DlRowPaymentOptions';

const Invoice = () => (
  <React.Fragment>
    <Container>
      <HeaderMain title='Invoice' className='mb-5 mt-4' />
      <Card>
        <CardBody className='d-flex justify-content-center pt-5'>
          <Row>
            <Col md={6}>
              <div className='mt-4 mb-2'>
                <span className='small lead'>Billed To</span>
              </div>
              <DlRowBilledTo
                leftSideClassName='text-lg-left'
                rightSideClassName='text-lg-right text-inverse'
              />
            </Col>
            <Col md={6}>
              <div className='mt-4 mb-2'>
                <span className=''>Payment Method</span>
              </div>
              <DlRowPaymentOptions
                leftSideClassName='text-lg-left'
                rightSideClassName='text-lg-right text-inverse'
              />
            </Col>
          </Row>
        </CardBody>

        <CardBody className='p-5'>
          <Row>
            <Col md={6}>
              <div className='mt-4 mb-2'>
                <span className=''>Article Details</span>
              </div>
              <DlRowArticleDetails
                leftSideClassName='text-lg-left'
                rightSideClassName='text-lg-right text-inverse'
              />
            </Col>
          </Row>
        </CardBody>

        {/* <CardFooter className='p-4 bt-0'>
          <div className='d-flex'>
            {currentStep !== sequence[0] && (
              <Button
                onClick={() => {
                  this._prevStep();
                }}
                color='link'
                className='mr-3'
              >
                <i className='fas fa-angle-left mr-2'></i>
                Previous
              </Button>
            )}
            {currentStep !== sequence[sequence.length - 1] && (
              <Button
                color='primary'
                onClick={() => {
                  this._nextStep();
                }}
                className='ml-auto px-4'
              >
                Next
                <i className='fas fa-angle-right ml-2'></i>
              </Button>
            )}
          </div>
        </CardFooter> */}
      </Card>
    </Container>
  </React.Fragment>
);
export default Invoice;
