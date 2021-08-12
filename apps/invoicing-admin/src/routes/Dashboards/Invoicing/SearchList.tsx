import React from 'react';
import { useLocalStorage } from '@rehooks/local-storage';

import {
  Card
} from '../../../components';

import { Loading } from '../../components';

const SearchList: React.FC<SearchListProps> = (props) => {
  const { pagination: defaultPaginator, filters } = props.state;

  const [{ pagination }] = useLocalStorage(
    'searchList',
    { pagination:  defaultPaginator, filters }
  );

  if (props.loading) return <Loading />;

  return (
    // <span className='bt-6 mt-4 ml-2' style={{ display: 'inline-block'}}><strong>{props.title.toUpperCase()}</strong></span>,
    <Card className='mb-0' style={{ marginTop: '16px'}}>
      {/* START Table */}
      <div className='table-responsive-xl'>
        {props.component}
      </div>
      {/* END Table */}
    </Card>
  );
};

interface SearchListProps {
  component: React.FC,
  loading: boolean,
  state: {
    pagination: {
      page: number;
      offset: number;
      limit: number;
    },
    filters: {
      referenceNumber: string;
      customId: string;
    }
  },
  setPage(key: string, value: string | boolean | any[]): void;
}

export default SearchList;
