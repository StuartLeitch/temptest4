import React from 'react';
import _ from 'lodash';

import { Badge } from '../../components';

import { InvoicesTableBody } from '../Invoices/List/components/TableBody';

/*eslint-disable */
const INVOICE_STATUS = {
  FINAL: (
    <Badge pill color='success'>
      Final
    </Badge>
  ),
  ACTIVE: (
    <Badge pill color='primary'>
      Active
    </Badge>
  ),
  DRAFT: (
    <Badge pill color='secondary'>
      Draft
    </Badge>
  ),
};

import {
  Card,
} from '../../components';

const InvoicesSearchResults: React.FC<SearchListProps> = (props) => {
  return (
    <Card className='mb-0'>
      <span className='bt-6 mt-1 ml-2' style={{ display: 'inline-block'}}><strong>{props.title.toUpperCase()}</strong></span>
      <InvoicesTableBody data={props.data} />
    </Card>
  );
};

interface SearchListProps {
  title: string,
  data: any[]
}


export default InvoicesSearchResults;
