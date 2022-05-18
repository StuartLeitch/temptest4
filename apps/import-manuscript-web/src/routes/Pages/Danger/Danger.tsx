import React from 'react';
import { Link } from 'react-router-dom';

import { HeaderAuth } from '../../components/Pages/HeaderAuth';

const Danger: React.FC = () => (
  <div>
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
  </div>
);

export default Danger;
