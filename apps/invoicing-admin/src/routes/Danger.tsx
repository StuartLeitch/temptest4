import React from 'react';
import { Link } from 'react-router-dom';

import { EmptyLayout } from '../components';
import { HeaderAuth } from './components/HeaderAuth';

const Danger: React.FC = () => (
  <EmptyLayout>
    <EmptyLayout.Section center>
      {/* START Header */}
      <HeaderAuth
        title='An Error has Occurred'
        icon='close'
        iconClassName='text-danger'
      />
      {/* END Header */}
      {/* START Bottom Links */}
      <div className='text-center mb-5'>
        <Link to='/' className='text-decoration-none'>
          <i className='fas fa-angle-left mr-2'></i>Correct Errors
        </Link>
      </div>
    </EmptyLayout.Section>
  </EmptyLayout>
);

export default Danger;
