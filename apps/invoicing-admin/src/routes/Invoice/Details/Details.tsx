import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'graphql-hooks';

import {
  Button,
  ButtonToolbar,
  Col,
  Container,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
  Nav,
  NavItem,
  TabPane,
  UncontrolledButtonDropdown,
  UncontrolledTabs,
} from '../../../components';

import { HeaderMain } from '../../components/HeaderMain';
import { InvoiceReminders } from '../../components/Invoice/reminders';

import { Loading } from '../../components';

import ApplyCouponModal from './components/ApplyCouponModal';
import CreateCreditNoteModal from './components/CreateCreditNoteModal';

import InvoiceDetailsTab from './components/InvoiceDetailsTab';
import ArticleDetailsTab from './components/ArticleDetailsTab';
import PayerDetailsTab from './components/PayerDetailsTab';
import InvoiceTimeline from './components/InvoiceTimeline';
import ErpReferencesTab from './components/ErpReferencesTab'

import { INVOICE_QUERY } from '../graphql';
import AddPaymentModal from './components/AddPaymentModal';

const APPLY_COUPON_MODAL_TARGET = 'applyCouponModal';
const CREATE_CREDIT_NOTE_MODAL_TARGET = 'createCreditNoteModal';

const Details: React.FC = (props) => {
  const { id } = useParams() as any;

  const { loading, error, data, refetch: invoiceQueryRefetch } = useQuery(
    INVOICE_QUERY,
    {
      variables: {
        id,
      },
    }
  );

  if (loading) return <Loading />;

  if (error || typeof data === undefined)
    return <div>Something Bad Happened</div>;

    console.log(data)

  const { invoiceWithAuthorization:invoice, getPaymentMethods } = data;
  const { status, id: invoiceId, transaction } = invoice;


  // * -> Net and total charges computing

  const { vat, coupons, waivers, price } = invoice?.invoiceItem;
  const reductions = [...coupons, ...waivers];
  let totalDiscountFromReductions = reductions.reduce(
    (acc, curr) => acc + curr.reduction,
    0
  );
  totalDiscountFromReductions =
    totalDiscountFromReductions > 100 ? 100 : totalDiscountFromReductions;
  const netCharges = price - (price * totalDiscountFromReductions) / 100;
  const vatAmount = (netCharges * vat) / 100;
  const totalCharges = netCharges + vatAmount;
  // * <-

  let statusClassName = 'warning';
  if (status === 'ACTIVE') {
    statusClassName = 'primary';
  }
  if (status === 'FINAL') {
    statusClassName = 'success';
  }

  const queryState = JSON.parse(localStorage.getItem('invoicesList'));
  const { filters, pagination } = queryState;

  const {
    invoiceStatus,
    transactionStatus,
    journalId,
    referenceNumber,
    customId,
  } = filters;
  const { page } = pagination;

  // * build the query string out of query state
  let queryString = '';
  if (Object.keys(Object.assign({}, queryState, pagination)).length) {
    queryString += '?';
    queryString += invoiceStatus.reduce(
      (qs, is) => (qs += `invoiceStatus=${is}&`),
      ''
    );
    queryString += transactionStatus.reduce(
      (qs, ts) => (qs += `transactionStatus=${ts}&`),
      ''
    );
    queryString += journalId.reduce((qs, ji) => (qs += `journalId=${ji}&`), '');

    if (referenceNumber) {
      queryString += `referenceNumber=${referenceNumber}&`;
    }

    if (customId) {
      queryString += `customId=${customId}&`;
    }

    if (page) {
      queryString += `page=${page}&`;
    }
  }

  return (
    <React.Fragment>
      <Container fluid={true}>
        <Link
          to={`/invoices/list${queryString}`}
          className='text-decoration-none d-block mb-4 mt-0'
        >
          <i className='fas fa-angle-left mr-2' /> Back to invoices list
        </Link>
        <HeaderMain
          title={`Invoice #${invoice.referenceNumber ?? '---'}`}
          className='mb-1 mt-0'
        />
        <Row>
          <Col lg={12}>
            <div className='d-flex mb-3'>
              <ButtonToolbar className='ml-auto'>
                <UncontrolledButtonDropdown className='mr-3'>
                  <DropdownToggle
                    color='link'
                    className='p-0 text-decoration-none'
                  >
                    <i
                      className={`fas fa-circle text-${statusClassName} mr-2`}
                    ></i>
                    {status}
                    <i className='fas fa-angle-down ml-2' />
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem header>Select Status</DropdownItem>
                    <DropdownItem>
                      <i className='fas fa-circle text-warning mr-2'></i>
                      Draft
                    </DropdownItem>
                    <DropdownItem>
                      <i className='fas fa-circle text-primary mr-2'></i>
                      Active
                    </DropdownItem>
                    <DropdownItem active>
                      <i className='fas fa-circle text-success mr-2'></i>
                      Final
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledButtonDropdown>

                {status === 'ACTIVE' && (
                  <AddPaymentModal
                    invoice={invoice}
                    getPaymentMethods={getPaymentMethods}
                    onSuccessCallback={invoiceQueryRefetch}
                  />
                )}

                {invoice.creditNote === null &&
                  (status === 'ACTIVE' || status === 'FINAL') &&
                  invoice.payments.every((p) => p.status !== 'PENDING') && (
                    <>
                      <Button
                        id={CREATE_CREDIT_NOTE_MODAL_TARGET}
                        color='danger'
                        className='mr-2'
                      >
                        Create Credit Note
                      </Button>
                    </>
                  )}

                {status === 'DRAFT' && (
                  <Button id={APPLY_COUPON_MODAL_TARGET} color='twitter'>
                    Apply Coupon
                  </Button>
                )}

                {transaction.status === 'ACTIVE' && status === 'DRAFT' && (
                  <Link to={`/invoices/split-invoice/${invoiceId}`}>
                    <Button color='secondary' className='ml-2'>
                      Split Invoice
                    </Button>
                  </Link>
                )}
              </ButtonToolbar>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={8}>
            <UncontrolledTabs initialActiveTabId='invoice'>
              <Nav tabs className='flex-column flex-md-row mt-4 mt-lg-0'>
                <NavItem>
                  <UncontrolledTabs.NavLink tabId='invoice'>
                    Invoice Details
                  </UncontrolledTabs.NavLink>
                </NavItem>
                <NavItem>
                  <UncontrolledTabs.NavLink tabId='article'>
                    Article Details
                  </UncontrolledTabs.NavLink>
                </NavItem>
                <NavItem>
                  <UncontrolledTabs.NavLink tabId='payer'>
                    Payer Details
                  </UncontrolledTabs.NavLink>
                </NavItem>
                <NavItem>
                  <UncontrolledTabs.NavLink tabId='reminders'>
                    Reminders
                  </UncontrolledTabs.NavLink>
                </NavItem>
                <NavItem>
                  <UncontrolledTabs.NavLink tabId='references'>
                    ERP References
                  </UncontrolledTabs.NavLink>
                </NavItem>
              </Nav>

              <UncontrolledTabs.TabContent>
                <TabPane tabId='invoice'>
                  <InvoiceDetailsTab
                    invoiceId={invoiceId}
                    invoice={invoice}
                    creditNote={invoice.creditNote}
                    netCharges={netCharges}
                    vatAmount={vatAmount}
                    totalCharges={totalCharges}
                  />
                </TabPane>
                <TabPane tabId='article'>
                  <ArticleDetailsTab invoice={invoice} />
                </TabPane>
                <TabPane tabId='payer'>
                  <PayerDetailsTab invoice={invoice} />
                </TabPane>
                <TabPane tabId='reminders'>
                  <InvoiceReminders />
                </TabPane>
                <TabPane tabId='references'>
                  <ErpReferencesTab invoice={invoice} />
                </TabPane>
              </UncontrolledTabs.TabContent>
            </UncontrolledTabs>
          </Col>
          <Col lg={4}>
            <InvoiceTimeline creditNote={invoice.creditNote} invoice={invoice} />
          </Col>
        </Row>
      </Container>

      <ApplyCouponModal
        target={APPLY_COUPON_MODAL_TARGET}
        invoiceId={invoiceId}
        onSuccessCallback={invoiceQueryRefetch}
      />
      <CreateCreditNoteModal
        invoiceItem={invoice?.invoiceItem}
        invoiceId={invoiceId}
        target={CREATE_CREDIT_NOTE_MODAL_TARGET}
        total={totalCharges}
        onSaveCallback={invoiceQueryRefetch}
      />
    </React.Fragment>
  );
};

export default Details;
