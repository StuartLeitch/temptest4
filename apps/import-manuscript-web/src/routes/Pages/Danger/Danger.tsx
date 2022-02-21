import React from 'react';
import { Link } from 'react-router-dom';

// import { EmptyLayout } from '../../../components';
import { HeaderAuth } from "../../components/Pages/HeaderAuth";
import { FooterAuth } from "../../components/Pages/FooterAuth";

const Danger: React.FC = () => (
  <div>
    { /* START Header */}
    <HeaderAuth
        title="An Error has Occurred"
        icon="close"
        iconClassName="text-danger"
    />
    { /* END Header */}
    { /* START Bottom Links */}
    <div className="text-center mb-5">
        <Link to="/" className="text-decoration-none">
            <i className="fas fa-angle-left mr-2"></i>Correct Errors
        </Link>
    </div>
    { /* END Bottom Links */}
    { /* START Footer */}
    <FooterAuth />
    { /* END Footer */}
  </div>
);

export default Danger;
