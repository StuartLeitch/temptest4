import React from 'react';
import { useQuery } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';

import { COUPONS_QUERY } from '../graphql';

import { Container, Row, Col, Spinner, Error } from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';

import List from './List';

const InvoicesContainer = () => {
  const { loading, error, data } = useQuery(COUPONS_QUERY, {
    variables: { pagination: { limit: 5, offset: 0 } },
  });

  if (loading)
    return (
      <LoadingOverlay
        active={loading}
        spinner={
          <Spinner
            style={{ width: '12em', height: '12em' }}
            color='secondary'
          />
        }
      />
    );

  if (error) return <Error data={error} />;

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='Coupons' className='mb-5 mt-4' />
        <Row>
          <Col lg={12}>
            <List coupons={data.coupons.coupons} />
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default InvoicesContainer;
