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
import Restricted from '../../../contexts/Restricted';

import { HeaderMain } from '../../components/HeaderMain';
import { InvoiceReminders } from '../../components/Invoice/reminders';

import { Loading } from '../../components';

import ApplyCouponModal from './components/ApplyCouponModal';
import CreateCreditNoteModal from './components/CreateCreditNoteModal';

import InvoiceDetailsTab from './components/InvoiceDetailsTab';
import ArticleDetailsTab from './components/ArticleDetailsTab';
import PayerDetailsTab from './components/PayerDetailsTab';
import InvoiceTimeline from './components/InvoiceTimeline';
import ErpReferencesTab from './components/ErpReferencesTab';

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

  const { invoiceWithAuthorization:invoice, getPaymentMethods } = data;
  const { status, id: invoiceId, transaction, totalPrice, vatAmount, netCharges } = invoice;

  let statusClassName = 'warning';
  if (status === 'ACTIVE') {
    statusClassName = 'primary';
  }
  if (status === 'FINAL') {
    statusClassName = 'success';
  }

  return (
    <>
      <Container fluid={true}>
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
                  <Restricted to='add.payment'>
                    <AddPaymentModal
                      invoice={invoice}
                      getPaymentMethods={getPaymentMethods}
                      onSuccessCallback={invoiceQueryRefetch}
                    />
                  </Restricted>
                )}

                {invoice.creditNote === null &&
                  (status === 'ACTIVE' || status === 'FINAL') &&
                  invoice.payments.every((p) => p.status !== 'PENDING') && (
                    <Restricted to='create.credit-note'>
                      <Button
                        id={CREATE_CREDIT_NOTE_MODAL_TARGET}
                        color='danger'
                        className='mr-2'
                        >
                        Create Credit Note
                      </Button>
                      <CreateCreditNoteModal
                        invoiceItem={invoice?.invoiceItem}
                        invoiceId={invoiceId}
                        target={CREATE_CREDIT_NOTE_MODAL_TARGET}
                        total={totalPrice}
                        onSaveCallback={invoiceQueryRefetch}
                      />
                    </Restricted>
                  )}

                {status === 'DRAFT' && (
                  <Restricted to='apply.coupon'>
                    <Button id={APPLY_COUPON_MODAL_TARGET} color='twitter'>
                      Apply Coupon
                    </Button>
                    <ApplyCouponModal
                      target={APPLY_COUPON_MODAL_TARGET}
                      invoiceId={invoiceId}
                      onSuccessCallback={invoiceQueryRefetch}
                    />
                  </Restricted>
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
                    totalCharges={totalPrice}
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
    </>
  );
};

export default Details;
