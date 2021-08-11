import React from 'react';
import numeral from 'numeral';
import format from 'date-fns/format';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { Invoice, CreditNote } from '../../Invoice/Details/types';
import { ButtonInput } from '../../Forms/DatePicker/components/ButtonInput'
import { formatDate } from '../../../utils/date;
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
} from '../../../components';

const CreditNoteDetailsTab: React.FC<CreditNoteDetailsTabProps> = ({
  invoiceId,
  invoice,
  creditNote,
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
                selected={formatDate(new Date(creditNote.dateIssued))}
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
                value={creditNote.persistentReferenceNumber}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
              <Label for='staticText' sm={12}>
                Cancelled Invoice
                <Link
                  to={`/invoices/details/${invoice.id}`}
                >
                  {
                    <span className='ml-1 font-weight-bold text-warning'>
                     {invoice.referenceNumber}
                    </span>
                  }
                </Link>
              </Label>
            </FormGroup>
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
                  {numeral(creditNote?.price).format(
                    '$0.00'
                  )}
                </span>
              </td>
              <td
                colSpan={2}
                className='align-middle text-right text-dark font-weight-bold'
              >
                {numeral(creditNote?.price).format(
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
                {numeral(creditNote?.price).format(
                  '$0.00'
                )}
              </td>
            </tr>
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

  return (
    <Card body className='border-top-0'>
      <CardBody>
        {creditNoteDetails()}
        {creditNoteCharges()}
      </CardBody>
    </Card>
  )
}

interface CreditNoteDetailsTabProps {
  invoiceId: string;
  invoice: Invoice;
  creditNote: CreditNote;
  netCharges: number;
  vat: number;
  total: number;
}

export default CreditNoteDetailsTab;
