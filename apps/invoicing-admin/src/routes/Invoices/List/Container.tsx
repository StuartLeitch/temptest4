import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Container, Row, Col } from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';
import PendingLogging from '../../components/PendingLogging';

import InvoicesList from './List';
// import ProjectsGrid from './ProjectsGrid';
import { InvoicesLeftNav } from '../../components/Invoices/InvoicesLeftNav';
import { ParseUtils } from '@utils';
// import { InvoicesSmHeader } from '../../components/Invoices/InvoicesSmHeader';

const createPath = (obj, path, value = null) => {
  path = typeof path === 'string' ? path.split('.') : path;
  let current = obj;
  while (path.length > 1) {
    const [head, ...tail] = path;
    path = tail;
    if (current[head] === undefined) {
      current[head] = {};
    }
    current = current[head];
  }
  current[path[0]] = value;
  return obj;
};

const InvoicesContainer = props => {
  const [filters, setFilters] = useState({
    invoiceStatus: new Set,
    transactionStatus: new Set,
    journalId: [],
    referenceNumber: null,
    customId: null
  });

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='Invoices' className='mb-5 mt-4' />
        <Row>
          <Col lg={3}>
            <InvoicesLeftNav setFilter={setFilter} />
          </Col>
          <Col lg={9}>
            {/* <InvoicesSmHeader
            subTitle={
              props.match.params.type === 'list'
                ? 'Projects List'
                : 'Projects Grid'
            }
            linkList='/apps/projects/list'
            linkGrid='/apps/projects/grid'
          />

          {props.match.params.type === 'list' ? ( */}
            <InvoicesList filters={filters} />
            {/* ) : (
            <ProjectsGrid />
          )} */}
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );

  /**
   * Updates the filter given by `key` to the new `value`.
   *
   * @param key The key of the filter to be updated (e.g. 'invoiceStatus.FINAL')
   * @param value The value of the filter being updated (varies by input type)
   */
  function setFilter(key: string, value: boolean|string|any[]) {
    const [name, status] = ParseUtils.parseEvent(key);
    const newFilters = { ...filters };    // FIXME: USe immutables here
    switch (name) {
    case 'invoiceStatus':
    case 'transactionStatus':
      newFilters[name] = new Set(filters[name]);
      if (value) {
        newFilters[name].add(status);
      } else {
        newFilters[name].delete(status);
      }
      break;

    case 'journalTitle':
      newFilters.journalId = (value as any[]).map(j => j.journalId);
      break;

    default:
      // 'referenceNumber'
      // 'customId'
      newFilters[name] = value;
    }

    setFilters(newFilters);
  }
};

InvoicesContainer.propTypes = {
  match: PropTypes.object.isRequired
};

export default InvoicesContainer;
