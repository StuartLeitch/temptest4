import React from 'react';

import {
  Card
} from '../../../components';
import { CreditNotesTableBody } from '../../CreditNotes/List/components/TableBody';

const CreditNotesSearchResults: React.FC<SearchListProps> = (props) => {

  return (
    <Card className='mb-0'>
      <span className='bt-6 mt-1 ml-2' style={{ display: 'inline-block'}}><strong>{props.title.toUpperCase()}</strong></span>
      <CreditNotesTableBody data={props.data} />
    </Card>
  );
};

interface SearchListProps {
  title: string,
  data: any[]
}

export default CreditNotesSearchResults;
