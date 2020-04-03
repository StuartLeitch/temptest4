/* eslint-disable no-unused-expressions */
import React, { useState } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';
import DatePicker from 'react-datepicker';
import format from 'date-fns/format';
// import subWeeks from 'date-fns/subWeeks';
import compareDesc from 'date-fns/compareDesc';
import { toast } from 'react-toastify';
import Toggle from 'react-toggle';
import numeral from 'numeral';

import {
  Accordion,
  Badge,
  Button,
  // ButtonDropdown,
  // ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  // CardGroup,
  // CardText,
  CardTitle,
  Col,
  // CardHeader,
  // CardFooter,
  Container,
  // CustomInput,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  ModalDropdown,
  // FormFeedback,
  Form,
  FormGroup,
  Media,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  Row,
  // FormText,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  Spinner,
  Table,
  TabPane,
  UncontrolledButtonDropdown,
  UncontrolledModal,
  UncontrolledTabs,
} from './../../../components';
import { HeaderMain } from '../../components/HeaderMain';
// import { HeaderDemo } from '../../components/HeaderDemo';
import { ButtonInput } from '../../Forms/DatePicker/components/ButtonInput';
import { TimelineMini } from '../../components/Timeline/TimelineMini';
// import { CardTextDemo } from '../../components/CardTextDemo';
// import { TimelineDefault } from '../../components/Timeline/TimelineDefault';
// import { DlRowContacts } from '../../components/Profile/DlRowContacts';
// import { DlRowAddress } from '../../components/Profile/DlRowAddress';
// import { TrTableMessages } from '../../Apps/ProfileDetails/components/TrTableMessages';
import { DlRowArticleDetails } from '../../components/Invoice/DlRowArticleDetails';
import { DlRowPayerDetails } from '../../components/Invoice/DlRowPayerDetails';
import { InvoiceReminders } from '../../components/Invoice/InvoiceReminders';
// import { Coupon } from '../../components/Invoice/Coupon';

const INVOICE_QUERY = `
query invoice($id: ID) {
  invoice(invoiceId: $id) {
    ...invoiceFragment
  }
  getPaymentMethods {
    ...paymentMethodFragment
  }
}
fragment invoiceFragment on Invoice {
  id: invoiceId
  status
  dateCreated
  dateIssued
  dateAccepted
  referenceNumber
  erpReference
  revenueRecognitionReference
  cancelledInvoiceReference
  payer {
    ...payerFragment
  }
  payments {
    ...paymentFragment
  }
  invoiceItem {
    id
    price
    type
    rate
    vat
    vatnote
    dateCreated
    coupons {
      ...couponFragment
    }
    waivers {
      ...waiverFragment
    }
    article {
      ...articleFragment
    }
  }
  creditNote {
    ...creditNoteFragment
  }
}
fragment payerFragment on Payer {
  id
  type
  name
  email
  vatId
  organization
  address {
    ...addressFragment
  }
}
fragment paymentFragment on Payment {
  id
  foreignPaymentId
  amount
  datePaid
  paymentMethod {
    ...paymentMethodFragment
  }
}
fragment paymentMethodFragment on PaymentMethod {
  id
  name
  isActive
}
fragment addressFragment on Address {
  city
  country
  state
  postalCode
  addressLine1
}
fragment couponFragment on Coupon {
  code
  reduction
}
fragment waiverFragment on Waiver {
  reduction
  type_id
}
fragment articleFragment on Article {
  id
  title
  created
  articleType
  authorCountry
  authorEmail
  customId
  journalTitle
  authorSurname
  authorFirstName
  journalTitle
  datePublished
}
fragment creditNoteFragment on Invoice {
  invoiceId
  dateCreated
  cancelledInvoiceReference
  referenceNumber
}
`;

const BANK_TRANSFER_MUTATION = `
mutation bankTransferPayment (
  $invoiceId: String!
  $payerId: String!
  $paymentMethodId: String!
  $amount: Float!
  $paymentReference: String!
  $datePaid: String!
  $markInvoiceAsPaid: Boolean
) {
  bankTransferPayment(
    invoiceId: $invoiceId
    payerId: $payerId
    paymentMethodId: $paymentMethodId
    paymentReference: $paymentReference
    amount: $amount
    datePaid: $datePaid
    markInvoiceAsPaid: $markInvoiceAsPaid
  ) {
    id
    foreignPaymentId
  }
}
`;

const CREATE_CREDIT_NOTE_MUTATION = `
mutation createCreditNote (
  $invoiceId: String!
  $createDraft: Boolean!,
) {
  createCreditNote(
    invoiceId: $invoiceId
    createDraft: $createDraft
  ) {
    id
  }
}
`;

const Details = () => {
  const { id } = useParams();
  const history = useHistory();

  const { loading, error, data } = useQuery(INVOICE_QUERY, {
    variables: {
      id,
    },
  });

  const [recordBankTransferPayment] = useMutation(BANK_TRANSFER_MUTATION);
  const [bankTransferPaymentData, setBankTransferPaymentData] = useState({
    paymentDate: new Date(),
    paymentAmount: 0,
    paymentReference: '',
  });
  const [recordCreditNote] = useMutation(CREATE_CREDIT_NOTE_MUTATION);
  const [creditNoteData, setCreditNoteData] = useState({
    createDraft: false,
  });

  if (loading)
    return (
      <LoadingOverlay
        active={loading}
        spinner={
          <Spinner style={{ width: '12em', height: '12em' }} color='primary' />
        }
      />
    );

  if (error || typeof data === undefined)
    return <div>Something Bad Happened</div>;

  const { invoice, getPaymentMethods } = data;
  // console.info(invoice);

  const { coupons, waivers, price } = invoice?.invoiceItem;
  let netCharges = price;
  if (coupons?.length) {
    netCharges -= coupons.reduce(
      (acc, coupon) => acc + (coupon.reduction / 100) * price,
      0
    );
  }
  if (waivers?.length) {
    netCharges -= waivers.reduce(
      (acc, waiver) => acc + (waiver.reduction / 100) * price,
      0
    );
  }
  const vat = (netCharges / 100) * invoice?.invoiceItem?.vat;
  const total = netCharges + vat;

  let statusClassName = 'warning';
  if (invoice.status === 'ACTIVE') {
    statusClassName = 'primary';
  }
  if (invoice.status === 'FINAL') {
    statusClassName = 'success';
  }

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain
          title={`Invoice #${invoice.referenceNumber}`}
          className='mb-5 mt-4'
        />
        {/* START Header 1 */}
        <Row>
          <Col lg={12}>
            <div className='d-flex mb-3'>
              {/* <CardTitle tag='h6'>Button Right Toolbar</CardTitle> */}
              <ButtonToolbar className='ml-auto'>
                <UncontrolledButtonDropdown className='mr-3'>
                  <DropdownToggle
                    color='link'
                    className='p-0 text-decoration-none'
                  >
                    <i
                      className={`fas fa-circle text-${statusClassName} mr-2`}
                    ></i>
                    {invoice.status}
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
                {invoice.status === 'ACTIVE' && (
                  <ModalDropdown
                    dropdownToggle={
                      <DropdownToggle color='primary' caret>
                        <i className='fas fa-dollar-sign mr-2'></i>
                        Add Payment
                      </DropdownToggle>
                    }
                    onSave={async () => {
                      const {
                        bankTransferPayment,
                      } = await recordBankTransferPayment({
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

                      return toast.success(({ closeToast }) => (
                        <Media>
                          <Media middle left className='mr-3'>
                            <i className='fas fa-fw fa-2x fa-check'></i>
                          </Media>
                          <Media body>
                            <Media heading tag='h6'>
                              Success!
                            </Media>
                            <p>
                              You successfully processed a bank transfer
                              payment.
                            </p>
                            <div className='d-flex mt-2'>
                              <Button
                                color='success'
                                onClick={() => {
                                  closeToast;
                                }}
                              >
                                Got it
                              </Button>
                              <Button
                                color='link'
                                onClick={() => {
                                  closeToast;
                                }}
                                className='ml-2 text-success'
                              >
                                Cancel
                              </Button>
                            </div>
                          </Media>
                        </Media>
                      ));
                    }}
                    onSaveAndMarkInvoiceAsFinal={async () => {
                      const {
                        bankTransferPayment,
                      } = await recordBankTransferPayment({
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

                      return toast.success(({ closeToast }) => (
                        <Media>
                          <Media middle left className='mr-3'>
                            <i className='fas fa-fw fa-2x fa-check'></i>
                          </Media>
                          <Media body>
                            <Media heading tag='h6'>
                              Success!
                            </Media>
                            <p>
                              You successfully processed a bank transfer
                              payment.
                            </p>
                            <div className='d-flex mt-2'>
                              <Button
                                color='success'
                                onClick={() => {
                                  closeToast;
                                }}
                              >
                                Got it
                              </Button>
                              <Button
                                color='link'
                                onClick={() => {
                                  closeToast;
                                }}
                                className='ml-2 text-success'
                              >
                                Cancel
                              </Button>
                            </div>
                          </Media>
                        </Media>
                      ));
                    }}
                  >
                    <ModalBody>
                      {/* START Form */}
                      <Form>
                        {/* START Input */}
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
                        {/* END Input */}
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
                                  const { name, value } = e.target;
                                  setBankTransferPaymentData({
                                    ...bankTransferPaymentData,
                                    paymentAmount: value,
                                  });
                                }}
                              />
                              {/* <InputGroupAddon addonType='append'>
                                .00
                              </InputGroupAddon> */}
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
                                const { name, value } = e.target;
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
                  //   </DropdownMenu>
                  // </UncontrolledButtonDropdown>
                )}
                {/* <Button color='secondary' className='mr-2' outline disabled>
                  Split Payment
                </Button> */}
                {invoice.creditNote === null &&
                  (invoice.status === 'ACTIVE' ||
                    invoice.status === 'FINAL') && (
                    <Button
                      id='modalCreateCreditNote'
                      color='danger'
                      className='mr-2'
                    >
                      Create Credit Note
                    </Button>
                  )}
                <UncontrolledModal target='modalCreateCreditNote' centered>
                  <ModalHeader tag='h4'>Create Credit Note</ModalHeader>
                  <ModalBody>
                    {/* START Form */}
                    <Form>
                      {/* START Input */}
                      <FormGroup row>
                        <Label sm={4}>Issue Date</Label>
                        <Col sm={8}>
                          <InputGroup>
                            <DatePicker
                              dateFormat='d MMMM yyyy'
                              customInput={<ButtonInput />}
                              selected={new Date()}
                              onChange={(date) => {
                                // setBankTransferPaymentData({
                                //   ...bankTransferPaymentData,
                                //   paymentDate: date
                                // });
                              }}
                            />
                          </InputGroup>
                        </Col>
                      </FormGroup>
                      {/* END Input */}
                      {/* START Amount Input */}
                      {/* <FormGroup row>
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
                              onChange={e => {
                                const { name, value } = e.target;
                                setBankTransferPaymentData({
                                  ...bankTransferPaymentData,
                                  paymentAmount: value
                                });
                              }}
                            />
                          </InputGroup>
                        </Col>
                      </FormGroup> */}
                      {/* END Amount Input */}
                      <FormGroup row>
                        {invoice?.invoiceItem && (
                          <>
                            <Label for='staticText' sm={4}>
                              Amount Value
                            </Label>
                            <Col sm={8}>
                              <span className='align-middle text-right h2 text-uppercase text-success font-weight-bold'>
                                {numeral(total.toFixed(2) * -1).format('$0.00')}
                              </span>
                            </Col>
                          </>
                        )}
                      </FormGroup>
                      <FormGroup row>
                        <Label for='staticText' sm={4}>
                          Reason
                        </Label>
                        <Col sm={8}>
                          <Input
                            type='select'
                            name='createDraft'
                            id='draftReason'
                            onChange={(e) => {
                              const { value } = e.target;
                              setCreditNoteData({
                                ...creditNoteData,
                                createDraft: !!value,
                              });
                            }}
                          >
                            <option value='0' selected>
                              Withdrawn Manuscript
                            </option>
                            <option value='1'>Reduction Applied</option>
                            <option value='0'>Waived Manuscript</option>
                            <option value='1'>Change Payer Details</option>
                            <option value='1'>Other</option>
                          </Input>
                        </Col>
                      </FormGroup>
                    </Form>
                    {/* END Form */}
                  </ModalBody>
                  <ModalFooter>
                    <UncontrolledModal.Close
                      color='link'
                      className='text-primary'
                    >
                      <i className='fas fa-close mr-2'></i>
                      Close
                    </UncontrolledModal.Close>
                    <UncontrolledModal.Close
                      color='link'
                      className='text-primary'
                    >
                      <Button
                        color='primary'
                        onClick={async (e) => {
                          const {
                            data: { createCreditNote: creditNote },
                          } = await recordCreditNote({
                            variables: {
                              ...creditNoteData,
                              invoiceId: invoice?.id,
                            },
                          });

                          return toast.success(({ closeToast }) => (
                            <Media>
                              <Media middle left className='mr-3'>
                                <i className='fas fa-fw fa-2x fa-check'></i>
                              </Media>
                              <Media body>
                                <Media heading tag='h6'>
                                  Success!
                                </Media>
                                <p>
                                  You've successfully created a Credit Note.
                                </p>
                                <div className='d-flex mt-2'>
                                  <Button
                                    color='success'
                                    onClick={() => {
                                      closeToast;
                                      history.push(
                                        `/credit-notes/details/${creditNote.id}`
                                      );
                                    }}
                                  >
                                    See details
                                  </Button>
                                  <Button
                                    color='link'
                                    onClick={() => {
                                      closeToast;
                                      // window.location = `/invoices/details/${creditNote.id}`;
                                    }}
                                    className='ml-2 text-success'
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </Media>
                            </Media>
                          ));
                        }}
                      >
                        <i className='fas fa-check mr-2'></i>
                        Save
                      </Button>
                    </UncontrolledModal.Close>
                  </ModalFooter>
                </UncontrolledModal>
                <Button color='primary' outline disabled>
                  Apply Coupon
                </Button>
              </ButtonToolbar>
            </div>
          </Col>
        </Row>
        {/* <Row>
        <Col lg={12}>
          <HeaderDemo
            no={1}
            title='Invoice Details'
            subTitle='Basic button layout options'
          />
        </Col>
      </Row> */}
        <Row>
          <Col lg={8}>
            <UncontrolledTabs initialActiveTabId='invoice'>
              {/* START Pills Nav */}
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
              {/* END Pills Nav */}
              <UncontrolledTabs.TabContent>
                <TabPane tabId='invoice'>
                  <Card body className='border-top-0'>
                    <CardBody>
                      <CardTitle tag='h6' className='mb-4'>
                        Invoice: Details
                        <span className='small ml-1 text-muted'>
                          #{invoice.id}
                        </span>
                      </CardTitle>
                      {/* START Form */}
                      <Form
                        style={{
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexDirection: 'row',
                          display: 'flex',
                        }}
                      >
                        <div style={{ flex: 1 }} className='mr-2'>
                          {/* START Input */}
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
                          {/* END Input */}
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
                      {/* END Form */}

                      <CardTitle tag='h6' className='mt-5 mb-4'>
                        Invoice: Charges
                        {/* <span className='small ml-1 text-muted'>#02</span> */}
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
                            invoice.invoiceItem.coupons.map((coupon) => (
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
                            {/* <td>Really?</td> */}
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
                            {/* <td>Really?</td> */}
                            <td className='align-middle text-right text-dark font-weight-bold'>
                              {numeral(vat.toFixed(2)).format('$0.00')}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan='3' style={{ borderTop: 'none' }}></td>
                            <td className='align-middle h4 text-uppercase text-dark font-weight-bold'>
                              Total
                            </td>
                            {/* <td>Really?</td> */}
                            <td className='align-middle text-right h2 text-uppercase text-success font-weight-bold'>
                              {numeral(total.toFixed(2)).format('$0.00')}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                      <CardTitle tag='h6' className='mt-5 mb-4'>
                        Invoice: Payments
                        {/* <span className='small ml-1 text-muted'>
                          #{invoice?.payment?.paymentMethod?.id}
                        </span> */}
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
                                    <a href='#'>{invoice?.payer?.email}</a>)
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
            {/* START Card Widget */}
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
            {/* END Card Widget */}
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default Details;
