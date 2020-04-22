import React from 'react';
import PropTypes from 'prop-types';

import { Container, Row, Col } from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';

import InvoicesList from './List';
import { InvoicesLeftNav } from '../../components/Invoices/InvoicesLeftNav';
import { ParseUtils } from '@utils';
import { useQueryState } from 'react-router-use-location-state';
import { writeStorage } from '@rehooks/local-storage';

// import QueryStateDisplay from './components/QueryStateDisplay';

const InvoicesContainer = (props: any) => {
  const [invoiceStatus, setInvoiceStatus] = useQueryState('invoiceStatus', []);
  const [transactionStatus, setTransactionStatus] = useQueryState(
    'transactionStatus',
    []
  );
  const [journalId, setJournalId] = useQueryState('journalId', []);
  const [referenceNumber, setReferenceNumber] = useQueryState(
    'referenceNumber',
    ''
  );
  const [customId, setCustomId] = useQueryState('customId', '');

  const filters = {
    invoiceStatus,
    transactionStatus,
    journalId,
    referenceNumber,
    customId,
  };

  writeStorage('invoicesListFilters', filters);

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='Invoices' className='mb-5 mt-4' />
        <Row>
          <Col lg={3}>
            {/* <QueryStateDisplay
              queryState={{
                invoiceStatus,
                transactionStatus,
                journalId,
                referenceNumber,
                customId,
              }}
            /> */}
            <InvoicesLeftNav filters={filters} setFilter={setFilter} />
          </Col>
          <Col lg={9}>
            <InvoicesList filters={filters} />
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
  function setFilter(key: string, value: boolean | string | any[]) {
    const [name, status] = ParseUtils.parseEvent(key);
    // const newFilters = { ...filters }; // FIXME: Use immutables here
    switch (name) {
      case 'invoiceStatus':
        if (invoiceStatus.includes(status)) {
          setInvoiceStatus(
            invoiceStatus.filter((s) => s !== status),
            { method: 'push' }
          );
        } else {
          setInvoiceStatus([...invoiceStatus, status], { method: 'push' });
        }
        break;

      case 'transactionStatus':
        if (transactionStatus.includes(status)) {
          setTransactionStatus(transactionStatus.filter((s) => s !== status));
        } else {
          setTransactionStatus([...transactionStatus, status]);
        }
        break;

      case 'journalTitle':
        setJournalId((value as any[]).map((j) => j.journalId));
        // newFilters.journalId = (value as any[]).map((j) => j.journalId);
        break;

      case 'referenceNumber':
        setReferenceNumber(value as string);
        break;

      default:
        // 'referenceNumber'
        // 'customId'
        setCustomId(value as string);
    }
  }
};

InvoicesContainer.propTypes = {
  match: PropTypes.object.isRequired,
};

export default InvoicesContainer;
