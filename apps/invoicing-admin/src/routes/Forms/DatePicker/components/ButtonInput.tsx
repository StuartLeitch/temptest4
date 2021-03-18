import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '../../../../components';

interface ButtonInputFRProps {
  value?: string;
  onClick?(): void;
}

const ButtonInputFR: React.FC<ButtonInputFRProps> = React.forwardRef<Button, ButtonInputFRProps>((props, ref) => (
  <Button outline onClick={props.onClick} ref={ref}>
    <i className='fas fa-fw fa-calendar mr-1' />
    {props.value}
  </Button>
));
// ButtonInputFR.propTypes = {
//   onClick: PropTypes.func,
//   value: PropTypes.string
// };


export { ButtonInputFR as ButtonInput };
