import React from 'react';
import numeral from 'numeral';
import format from 'date-fns/format';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { Invoice } from '../types';
import { ButtonInput } from '../../../Forms/DatePicker/components/ButtonInput';
import {
  Badge,
  Card,
  CardBody,
  CardTitle,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Table,
} from '../../../../components';

const CreditNoteDetailsTab: React.FC<CreditNoteDetailsTabProps> = ({
  invoiceId,
  invoice,
  netCharges,
  vat,
  total
}) => {

  const creditNoteDetails = () => (
    <>
      <CardTitle tag='h6' className='mb-4'>
        Credit Note: Details
        <span className='small ml-1 text-muted'>
          #{invoiceId}
        </span>
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
            <Label sm={5}>Credit Note Issue Date</Label>
            <Col sm={7}>
              <DatePicker
              disabled
                customInput={<ButtonInput />}
                selected={new Date(invoice.dateIssued)}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for='staticText' sm={5}>
              Ref. Number
            </Label>
            <Col sm={7}>
              <Input
                plaintext
                readOnly
                value={`CN-${invoice.referenceNumber}`}
              />
            </Col>
          </FormGroup>
          {invoice.cancelledInvoiceReference && (
            <FormGroup row>
              <Label for='staticText' sm={12}>
                Cancelled Invoice
                <Link
                  to={`/invoices/details/${invoice.cancelledInvoiceReference}`}
                >
                  {
                    <span className='ml-1 font-weight-bold text-warning'>
                      {invoice.referenceNumber}
                    </span>
                  }
                </Link>
              </Label>
            </FormGroup>
          )}
        </div>
      </Form>
    </>
  )

  const creditNoteCharges = () => (
    <>
      <CardTitle tag='h6' className='mt-5 mb-4'>
          Credit Note: Charges
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
              <td colSpan={2} className='align-middle text-right'>
                <span>
                  {numeral(invoice?.invoiceItem?.price).format(
                    '$0.00'
                  )}
                </span>
              </td>
              <td
                colSpan={2}
                className='align-middle text-right text-dark font-weight-bold'
              >
                {numeral(invoice?.invoiceItem?.price).format(
                  '$0.00'
                )}
              </td>
            </tr>
            <tr>
              <td colSpan={3}></td>
              <td className='align-middle'>
                <span className='text-uppercase text-muted font-weight-bold'>
                  Sub&ndash;Total
                </span>
              </td>
              <td className='align-middle text-right text-dark font-weight-bold'>
                {numeral(invoice?.invoiceItem?.price).format(
                  '$0.00'
                )}
              </td>
            </tr>
            {invoice?.invoiceItem?.coupons?.length > 0 &&
              invoice.invoiceItem.coupons.map((coupon) => (
                <tr>
                  <td
                    colSpan={2}
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
                    &ndash;
                    {numeral(
                      (invoice.invoiceItem.price *
                        coupon.reduction) /
                        100
                    ).format('$0.00')}
                  </td>
                </tr>
              ))}
            {invoice?.invoiceItem?.waivers?.length > 0 &&
              invoice.invoiceItem.waivers.map((waiver) => (
                <tr>
                  <td
                    colSpan={2}
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
                    &ndash;$
                    {(waiver.reduction / 100) *
                      invoice.invoiceItem.price}
                  </td>
                </tr>
              ))}
            <tr>
              <td colSpan={3} style={{ borderTop: 'none' }}></td>
              <td className='align-middle text-uppercase text-muted font-weight-bold'>
                Net Charges
              </td>
              {/* <td>Really?</td> */}
              <td className='align-middle text-right text-dark font-weight-bold'>
                {numeral(netCharges).format('$0.00')}
              </td>
            </tr>
            <tr>
              <td colSpan={3} style={{ borderTop: 'none' }}></td>
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
              <td colSpan={3} style={{ borderTop: 'none' }}></td>
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
    </>
  )

  const creditNotePayments = () => (
    <>
      <CardTitle tag='h6' className='mt-5 mb-4'>
        Credit Note: Payments
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
    </>
  )

  return (
    <Card body className='border-top-0'>
      <CardBody>
        {creditNoteDetails()}
        {creditNoteCharges()}
        {creditNotePayments()}
      </CardBody>
    </Card>
  )
}

interface CreditNoteDetailsTabProps {
  invoiceId: string;
  invoice: Invoice;
  netCharges: number;
  vat: number;
  total: number;
}

export default CreditNoteDetailsTab;
