/* eslint-disable no-unused-expressions */

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'graphql-hooks';
import DatePicker from 'react-datepicker';
import format from 'date-fns/format';
import compareDesc from 'date-fns/compareDesc';
import { toast } from 'react-toastify';
import numeral from 'numeral';

import {
  Badge,
  Button,
  ButtonToolbar,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  ModalDropdown,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  Row,
  ModalBody,
  Nav,
  NavItem,
  Table,
  TabPane,
  UncontrolledButtonDropdown,
  UncontrolledTabs,
} from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';
import { TimelineMini } from '../../components/Timeline/TimelineMini';
import { DlRowArticleDetails } from '../../components/Invoice/DlRowArticleDetails';
import { DlRowPayerDetails } from '../../components/Invoice/DlRowPayerDetails';
import { InvoiceReminders } from '../../components/Invoice/reminders';

import { Loading } from '../../components';

import { ButtonInput } from '../../Forms/DatePicker/components/ButtonInput';

import ApplyCouponModal from './ApplyCouponModal';
import CreateCreditNoteModal from './CreateCreditNoteModal';
import SuccessfulPaymentToast from './SuccessfulPaymentToast';

import Config from '../../../config';

import { INVOICE_QUERY, BANK_TRANSFER_MUTATION } from '../graphql';

const APPLY_COUPON_MODAL_TARGET = 'applyCouponModal';
const CREATE_CREDIT_NOTE_MODAL_TARGET = 'createCreditNoteModal';

const Details = () => {
  const { id } = useParams();

  const { loading, error, data, refetch: invoiceQueryRefetch } = useQuery(
    INVOICE_QUERY,
    {
      variables: {
        id,
      },
    }
  );

  const [recordBankTransferPayment] = useMutation(BANK_TRANSFER_MUTATION);
  const [bankTransferPaymentData, setBankTransferPaymentData] = useState({
    paymentDate: new Date(),
    paymentAmount: 0,
    paymentReference: '',
  });

  if (loading) return <Loading />;

  if (error || typeof data === undefined)
    return <div>Something Bad Happened</div>;

  const { invoice, getPaymentMethods } = data;
  const { status, id: invoiceId } = invoice;

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

  const queryState = JSON.parse(localStorage.getItem('invoicesListFilters'));
  const paginationState = JSON.parse(
    localStorage.getItem('invoicesListPagination')
  );
  const {
    invoiceStatus,
    transactionStatus,
    journalId,
    referenceNumber,
    customId,
  } = queryState;
  const { page } = paginationState;

  // * build the query string out of query state
  let queryString = '';
  if (Object.keys(Object.assign({}, queryState, paginationState)).length) {
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
          title={`Invoice #${invoice.referenceNumber}`}
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
                  <ModalDropdown
                    dropdownToggle={
                      <DropdownToggle color='primary' caret>
                        <i className='fas fa-dollar-sign mr-2'></i>
                        Add Payment
                      </DropdownToggle>
                    }
                    onSave={async () => {
                      await recordBankTransferPayment({
                        variables: {
                          invoiceId: invoice?.id,
                          payerId: invoice?.payer?.id,
                          paymentMethodId: getPaymentMethods.find(
                            (pm) => pm.name === 'Bank Transfer'
                          ).id,
                          amount: parseFloat(
                            bankTransferPaymentData.paymentAmount
                          ),
                          paymentReference:
                            bankTransferPaymentData.paymentReference,
                          datePaid: bankTransferPaymentData.paymentDate.toISOString(),
                          markInvoiceAsPaid: false,
                        },
                      });

                      return toast.success(SuccessfulPaymentToast);
                    }}
                    onSaveAndMarkInvoiceAsFinal={async () => {
                      await recordBankTransferPayment({
                        variables: {
                          invoiceId: invoice?.id,
                          payerId: invoice?.payer?.id,
                          paymentMethodId: getPaymentMethods.find(
                            (pm) => pm.name === 'Bank Transfer'
                          ).id,
                          amount: parseFloat(
                            bankTransferPaymentData.paymentAmount
                          ),
                          paymentReference:
                            bankTransferPaymentData.paymentReference,
                          datePaid: bankTransferPaymentData.paymentDate.toISOString(),
                          markInvoiceAsPaid: true,
                        },
                      });

                      return toast.success(SuccessfulPaymentToast);
                    }}
                  >
                    <ModalBody>
                      {/* START Form */}
                      <Form>
                        {/* START Payment Date Input */}
                        <FormGroup row>
                          <Label sm={4}>Payment Date</Label>
                          <Col sm={8}>
                            <InputGroup>
                              <DatePicker
                                dateFormat='d MMMM yyyy'
                                customInput={<ButtonInput />}
                                selected={bankTransferPaymentData.paymentDate}
                                onChange={(date) => {
                                  setBankTransferPaymentData({
                                    ...bankTransferPaymentData,
                                    paymentDate: date,
                                  });
                                }}
                              />
                            </InputGroup>
                          </Col>
                        </FormGroup>
                        {/* END Payment Date Input */}

                        {/* START Amount Input */}
                        <FormGroup row>
                          <Label for='bothAddon' sm={4}>
                            Payment Amount
                          </Label>
                          <Col sm={8}>
                            <InputGroup>
                              <InputGroupAddon addonType='prepend'>
                                $
                              </InputGroupAddon>
                              <Input
                                placeholder='Amount...'
                                id='bothAddon'
                                onChange={(e) => {
                                  const { value } = e.target;
                                  setBankTransferPaymentData({
                                    ...bankTransferPaymentData,
                                    paymentAmount: value,
                                  });
                                }}
                              />
                            </InputGroup>
                          </Col>
                        </FormGroup>
                        {/* END Amount Input */}

                        <FormGroup row>
                          <Label for='staticText' sm={4}>
                            Payment Method
                          </Label>
                          <Col sm={8}>
                            <Input plaintext readOnly value={'Bank Transfer'} />
                          </Col>
                        </FormGroup>

                        <FormGroup row>
                          <Label for='staticText' sm={4}>
                            Payment Reference
                          </Label>
                          <Col sm={8}>
                            <Input
                              placeholder='Reference'
                              onChange={(e) => {
                                const { value } = e.target;
                                setBankTransferPaymentData({
                                  ...bankTransferPaymentData,
                                  paymentReference: value,
                                });
                              }}
                            />
                          </Col>
                        </FormGroup>
                      </Form>
                      {/* END Form */}
                    </ModalBody>
                  </ModalDropdown>
                )}

                {invoice.creditNote === null &&
                  (status === 'ACTIVE' || status === 'FINAL') && (
                    <>
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
                        total={totalCharges}
                      />
                    </>
                  )}

                <Button
                  id={APPLY_COUPON_MODAL_TARGET}
                  color='twitter'
                  outline={status !== 'DRAFT'}
                  disabled={status !== 'DRAFT'}
                >
                  Apply Coupon
                </Button>
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
              </Nav>

              <UncontrolledTabs.TabContent>
                <TabPane tabId='invoice'>
                  <Card body className='border-top-0'>
                    <CardBody>
                      <CardTitle tag='h6' className='d-flex'>
                        Invoice: Details
                        <a
                          target='_blank'
                          rel='noopener noreferrer'
                          href={`${Config.feRoot}/payment-details/${invoiceId}`}
                          className='ml-auto'
                        >
                          {
                            <span className='font-weight-normal text-underlined text-blue'>
                              <u>#{invoiceId}</u>
                            </span>
                          }
                        </a>
                      </CardTitle>
                      <Form
                        style={{
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexDirection: 'row',
                          display: 'flex',
                        }}
                      >
                        <div style={{ flex: 1 }} className='mr-2'>
                          <FormGroup row>
                            <Label sm={5}>Invoice Issue Date</Label>
                            <Col sm={7}>
                              <DatePicker
                                customInput={<ButtonInput />}
                                selected={new Date(invoice.dateIssued)}
                                onChange={() => ({})}
                              />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label sm={5}>Date of Supply</Label>
                            <Col sm={7}>
                              <DatePicker
                                readOnly
                                customInput={<ButtonInput />}
                                selected={Date.now()}
                              />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for='staticText' sm={5}>
                              Terms
                            </Label>
                            <Col sm={7}>
                              <Input
                                readOnly
                                plaintext
                                value='Payable upon Receipt'
                              />
                            </Col>
                          </FormGroup>
                          {invoice.creditNote && (
                            <FormGroup row>
                              <Label for='staticText' sm={12}>
                                Credit Note
                                <Link
                                  to={`/credit-notes/details/${invoice.creditNote.invoiceId}`}
                                >
                                  {
                                    <span className='ml-1 font-weight-bold text-warning'>
                                      Credit Note #
                                      {invoice.creditNote.referenceNumber}
                                    </span>
                                  }
                                </Link>
                              </Label>
                            </FormGroup>
                          )}
                        </div>
                        <div style={{ flex: 1 }} className='ml-2'>
                          <FormGroup row>
                            <Label for='staticText' sm={5}>
                              Ref. Number
                            </Label>
                            <Col sm={7}>
                              <Input
                                plaintext
                                readOnly
                                value={invoice.referenceNumber}
                              />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for='staticText' sm={5}>
                              ERP Reference
                            </Label>
                            <Col sm={7}>
                              <Input
                                plaintext
                                readOnly
                                value={invoice.erpReference}
                              />
                            </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Label for='staticText' sm={5}>
                              Rev. Rec. ERP Ref.
                            </Label>
                            <Col sm={7}>
                              <Input
                                plaintext
                                readOnly
                                value={invoice.revenueRecognitionReference}
                              />
                            </Col>
                          </FormGroup>
                        </div>
                      </Form>

                      <CardTitle tag='h6' className='mt-5 mb-4'>
                        Invoice: Charges
                      </CardTitle>
                      <Table className='mb-0' responsive>
                        <thead className='thead-light'>
                          <tr>
                            <th className='bt-1'>Item</th>
                            <th className='bt-1 w-25'></th>
                            <th className='text-right bt-1'>Price</th>
                            <th className='bt-1'></th>
                            <th className='text-right bt-1'>Totals</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className='align-middle'>
                              <span>{invoice?.invoiceItem?.type}</span>
                            </td>
                            <td colSpan='2' className='align-middle text-right'>
                              <span>${invoice?.invoiceItem?.price}</span>
                            </td>
                            <td
                              colSpan='2'
                              className='align-middle text-right text-dark font-weight-bold'
                            >
                              ${invoice?.invoiceItem?.price}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan='3'></td>
                            <td className='align-middle'>
                              <span className='text-uppercase text-muted font-weight-bold'>
                                Sub&ndash;Total
                              </span>
                            </td>
                            <td className='align-middle text-right text-dark font-weight-bold'>
                              ${invoice?.invoiceItem?.price}
                            </td>
                          </tr>
                          {invoice?.invoiceItem?.coupons?.length > 0 &&
                            invoice.invoiceItem.coupons.map((coupon, index) => (
                              <tr key={index}>
                                <td
                                  colSpan='2'
                                  style={{ borderTop: 'none' }}
                                ></td>
                                <td
                                  className='align-middle text-right'
                                  style={{ borderTop: 'none' }}
                                >
                                  <Badge pill color='success'>
                                    coupon
                                  </Badge>
                                </td>
                                <td>
                                  <span className='small mt-2'>
                                    {coupon.code}
                                  </span>
                                  <span className='text-muted px-2'>
                                    (&ndash;{coupon.reduction}%)
                                  </span>
                                </td>
                                <td className='align-middle text-right text-dark font-weight-bold'>
                                  &ndash;$
                                  {(invoice.invoiceItem.price *
                                    coupon.reduction) /
                                    100}
                                </td>
                              </tr>
                            ))}
                          {invoice?.invoiceItem?.waivers?.length > 0 &&
                            invoice.invoiceItem.waivers.map((waiver) => (
                              <tr>
                                <td
                                  colSpan='2'
                                  style={{ borderTop: 'none' }}
                                ></td>
                                <td
                                  className='align-middle text-right'
                                  style={{ borderTop: 'none' }}
                                >
                                  <Badge pill color='success'>
                                    waiver
                                  </Badge>
                                </td>
                                <td>
                                  <span className='small mt-2'>
                                    {waiver.type_id}
                                  </span>
                                  <span className='text-muted px-2'>
                                    (&ndash;{waiver.reduction}%)
                                  </span>
                                </td>
                                <td className='align-middle text-right text-dark font-weight-bold'>
                                  {numeral(
                                    (waiver.reduction / 100) *
                                      invoice.invoiceItem.price *
                                      -1
                                  ).format('$0.00')}
                                </td>
                              </tr>
                            ))}
                          <tr>
                            <td colSpan='3' style={{ borderTop: 'none' }}></td>
                            <td className='align-middle text-uppercase text-muted font-weight-bold'>
                              Net Charges
                            </td>
                            <td className='align-middle text-right text-dark font-weight-bold'>
                              {numeral(netCharges).format('$0.00')}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan='3' style={{ borderTop: 'none' }}></td>
                            <td className='align-middle'>
                              <span className='text-uppercase text-muted font-weight-bold'>
                                VAT
                              </span>
                              <span className='text-muted px-2'>
                                (+{invoice?.invoiceItem?.vat}%)
                              </span>
                            </td>
                            <td className='align-middle text-right text-dark font-weight-bold'>
                              {numeral(vatAmount.toFixed(2)).format('$0.00')}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan='3' style={{ borderTop: 'none' }}></td>
                            <td className='align-middle h4 text-uppercase text-dark font-weight-bold'>
                              Total
                            </td>
                            <td className='align-middle text-right h2 text-uppercase text-success font-weight-bold'>
                              {numeral(totalCharges.toFixed(2)).format('$0.00')}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                      <CardTitle tag='h6' className='mt-5 mb-4'>
                        Invoice: Payments
                      </CardTitle>
                      {invoice?.payments?.length === 0 && (
                        <span className='medium text-muted'>
                          No payments processed yet.
                        </span>
                      )}
                      {invoice?.payments?.length > 0 &&
                        invoice?.payments?.map((payment) => {
                          const paymentMethod = payment?.paymentMethod?.name;
                          let paymentMethodClassName = '';
                          switch (paymentMethod) {
                            case 'Credit Card':
                              paymentMethodClassName = 'fas fa-credit-card';
                              break;
                            case 'Bank Transfer':
                              paymentMethodClassName = 'fas fa-landmark';
                              break;
                            default:
                              paymentMethodClassName = 'fab fa-paypal';
                          }

                          return (
                            <React.Fragment key={payment.id}>
                              <h6 className='my-3'>
                                <i
                                  className={`fa-fw text-primary mr-2 ${paymentMethodClassName}`}
                                ></i>
                                {` ${paymentMethod}`}
                                <span className='small ml-1 text-muted'>
                                  payment method
                                </span>
                              </h6>
                              <Row tag='dl'>
                                <dt className='col-sm-4'>Payer</dt>
                                <dd className='col-sm-8 text-inverse'>
                                  <samp>
                                    {invoice?.payer?.name} (
                                    <a href={`mailto:${invoice?.payer?.email}`}>
                                      {invoice?.payer?.email}
                                    </a>
                                    ))
                                  </samp>
                                </dd>

                                <dt className='col-sm-4'>Paid Date</dt>
                                <dd className='col-sm-8 text-inverse'>
                                  {format(
                                    new Date(payment?.datePaid),
                                    'dd MMMM yyyy'
                                  )}
                                </dd>
                                <dt className='col-sm-4'>Amount</dt>
                                <dd className='col-sm-8 text-inverse'>
                                  {' '}
                                  $ {payment?.amount.toFixed(2)}
                                </dd>
                                <dt className='col-sm-4'>External Reference</dt>
                                <dd className='col-sm-8 text-success'>
                                  {payment?.foreignPaymentId}
                                </dd>
                              </Row>
                            </React.Fragment>
                          );
                        })}
                    </CardBody>
                  </Card>
                </TabPane>
                <TabPane tabId='article'>
                  <Card body className='border-top-0'>
                    <CardBody>
                      <CardTitle tag='h6' className='mb-4'>
                        Article: Details
                        <span className='small ml-1 text-muted'>
                          #{invoice?.invoiceItem?.article?.id}
                        </span>
                      </CardTitle>
                      <DlRowArticleDetails
                        {...invoice?.invoiceItem?.article}
                        leftSideClassName='text-lg-right'
                        rightSideClassName='text-inverse'
                      />
                    </CardBody>
                  </Card>
                </TabPane>
                <TabPane tabId='payer'>
                  <Card body className='border-top-0'>
                    <CardBody>
                      <CardTitle tag='h6' className='mb-4'>
                        Payer: Details
                        <span className='small ml-1 text-muted'>
                          #{invoice?.payer?.id}
                        </span>
                      </CardTitle>
                      <div className='mt-4 mb-2'>
                        <span className='small'>Contact</span>
                      </div>
                      <DlRowPayerDetails
                        {...invoice?.payer}
                        leftSideClassName='text-lg-right'
                        rightSideClassName='text-inverse'
                      />
                      <div className='mt-4 mb-2'>
                        <span className='small'>Address</span>
                      </div>
                      <dl className='row'>
                        {' '}
                        <dt className={`col-sm-3 text-lg-right`}>
                          Address Line 1
                        </dt>
                        <dd className={`col-sm-9 text-inverse`}>
                          {invoice?.payer?.address?.addressLine1}
                        </dd>
                        <dt className={`col-sm-3 text-lg-right`}>City</dt>
                        <dd className={`col-sm-9 text-inverse`}>
                          {invoice?.payer?.address?.city}
                        </dd>
                        <dt className={`col-sm-3 text-lg-right`}>Country</dt>
                        <dd className={`col-sm-9 text-inverse`}>
                          {invoice?.payer?.address?.country}
                        </dd>
                        <dt className={`col-sm-3 text-lg-right`}>State</dt>
                        <dd className={`col-sm-9 text-inverse`}>
                          {invoice?.payer?.address?.state}
                        </dd>
                        <dt className={`col-sm-3 text-lg-right`}>
                          Postal Code
                        </dt>
                        <dd className={`col-sm-9 text-inverse`}>
                          {invoice?.payer?.address?.postalCode}
                        </dd>
                      </dl>
                    </CardBody>
                  </Card>
                </TabPane>
                <TabPane tabId='reminders'>
                  <InvoiceReminders id={id}></InvoiceReminders>
                </TabPane>
              </UncontrolledTabs.TabContent>
            </UncontrolledTabs>
          </Col>
          <Col lg={4}>
            <Card className='mb-3'>
              <CardBody>
                <CardTitle tag='h6'>Timeline</CardTitle>

                {invoice?.dateCreated && (
                  <TimelineMini
                    icon='circle'
                    badgeTitle='Draft'
                    badgeColor='secondary'
                    date={format(
                      new Date(invoice?.dateCreated),
                      'dd MMMM yyyy'
                    )}
                    phrase={'Invoice enters DRAFT state.'}
                  />
                )}

                {invoice?.dateIssued && (
                  <TimelineMini
                    icon='times-circle'
                    iconClassName='text-primary'
                    badgeTitle='Active'
                    badgeColor='primary'
                    date={format(new Date(invoice?.dateIssued), 'dd MMMM yyyy')}
                    phrase={'Invoice enters ACTIVE state.'}
                  />
                )}

                {invoice?.payments?.length > 0 && (
                  <TimelineMini
                    icon='check-circle'
                    iconClassName='text-success'
                    badgeTitle='Paid'
                    badgeColor='success'
                    date={format(
                      invoice?.payments
                        ?.map((i) => new Date(i.datePaid))
                        .sort(compareDesc)[0],
                      'dd MMMM yyyy'
                    )}
                    phrase={'Invoice enters FINAL state.'}
                  />
                )}

                {invoice?.dateMovedToFinal && (
                  <TimelineMini
                    icon='check-circle'
                    iconClassName='text-success'
                    badgeTitle='Finalized'
                    badgeColor='success'
                    date={format(
                      new Date(invoice?.dateMovedToFinal),
                      'dd MMMM yyyy'
                    )}
                    phrase={'Invoice enters FINAL state.'}
                  />
                )}

                {invoice?.creditNote && (
                  <TimelineMini
                    icon='check-circle'
                    iconClassName='text-warning'
                    badgeTitle='Credit Note'
                    badgeColor='warning'
                    date={format(
                      new Date(invoice?.creditNote?.dateCreated),
                      'dd MMMM yyyy'
                    )}
                    phrase={'Credit Note issued.'}
                  />
                )}

                {invoice?.invoiceItem?.article?.datePublished && (
                  <TimelineMini
                    icon='play-circle'
                    iconClassName='text-blue'
                    badgeTitle='Published'
                    badgeColor='blue'
                    date={format(
                      new Date(invoice?.invoiceItem?.article?.datePublished),
                      'dd MMMM yyyy'
                    )}
                    phrase={'Article enters PUBLISHED state.'}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <ApplyCouponModal
        target={APPLY_COUPON_MODAL_TARGET}
        invoiceId={invoiceId}
        onSuccessCallback={invoiceQueryRefetch}
      />
    </React.Fragment>
  );
};

export default Details;
