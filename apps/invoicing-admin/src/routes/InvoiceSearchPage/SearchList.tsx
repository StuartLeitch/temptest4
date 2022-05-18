import React from 'react';

import { Card } from '../../components';

import { Loading } from '../components';

const SearchList: React.FC<SearchListProps> = (props) => {
  if (props.loading) return <Loading />;

  return (
    <Card className='mb-0' style={{ marginTop: '16px' }}>
      {/* START Table */}
      <div className='table-responsive-xl'>{props.component}</div>
      {/* END Table */}
    </Card>
  );
};

interface SearchListProps {
  component: React.FC;
  loading: boolean;
  setPage(key: string, value: string | boolean | any[]): void;
}

export default SearchList;
