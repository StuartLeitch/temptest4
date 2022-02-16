import React from 'react';
import { useAuth } from '../../contexts/Auth';

import { LogoThemed } from '../../routes/components/LogoThemed/LogoThemed';
import { UserDropdown } from '../../routes/components/UserDropdown/UserDropdown';

import { Button } from '@hindawi/phenom-ui';

export const DefaultHeader: React.FC<{reviewUrl: string}> = ({reviewUrl}) => {
  const auth = useAuth();

  return (
    <header>
      <LogoThemed />
      <div className={'buttons-group'}>
        <Button type='ghost' style={{ marginRight: '20px' }}>
          Transfer Manuscript
        </Button>
        <Button type='primary'>New Submission</Button>
        <UserDropdown {...auth} reviewUrl={reviewUrl} />
      </div>
    </header>
  );
};
