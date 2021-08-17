import React from 'react';
import { useQuery } from 'graphql-hooks';
import { useParams } from 'react-router-dom';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

import { AUDIT_LOG_QUERY } from './graphql';

import {
  Container,
  Row,
  Col,
  Error,
  Card,
} from '../../components';

import { HeaderMain } from '../components/HeaderMain';
import { Loading } from '../components';

const AuditLogContainer: React.FC = () => {
  const { id } = useParams() as any;

  const { loading, error, data } = useQuery(
    AUDIT_LOG_QUERY,
    {
      variables: {
        id,
      },
    }
  );

  const Content = ({ loading, error, data }) => {
    if (loading) return <Loading />;

    if (error) return <Error error={error} />;

    if (data) {
      const oldData = `${data.auditlog.oldValue}`;
      const newData = JSON.stringify(JSON.parse(data.auditlog.currentValue), null, '\t');

      return (
        <>
          <Card className='mb-0'>
            <ReactDiffViewer
              oldValue={oldData}
              newValue={newData}
              compareMethod={DiffMethod.WORDS}
              splitView={true}
            />
          </Card>
        </>
      );
    }
  };

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='Audit Logs' className='mb-5 mt-4' />
        <Row>
          <Col lg={12} className="mb-5">
            <Content {...{ loading, error, data }} />
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default AuditLogContainer;
