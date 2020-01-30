import React from 'react';
import PropTypes from 'prop-types';
import faker from 'faker/locale/en_US';
import { Media, Button } from 'reactstrap';

const Coupon = props => (
  <Media className={`${props.mediaClassName}`}>
    <Media left className='mr-2'>
      <span className='fa-stack fa-lg'>
        <i
          className={`fas fa-square fa-stack-2x fa-${props.BgIcon} fa-stack-1x ${props.BgIconClassName}`}
        ></i>
        <i
          className={`fas fa-${props.icon} fa-stack-1x ${props.iconClassName}`}
        ></i>
      </span>
    </Media>
    <Media body className='d-flex flex-column flex-md-row'>
      <div>
        <div className='text-inverse text-truncate'>{props.code}</div>
        <span>
          by <span className='text-muted'> · </span>
          <span>{props.reduction} %</span>
        </span>
      </div>
      {/* <div className='ml-md-auto flex-row-reverse flex-md-row d-flex justify-content-end mt-2 mt-md-0'>
        <div className='text-left text-md-right mr-3'>
          04-Oct-2012
          <br />
          05:20 PM
        </div>
        <Button color='link' className='align-self-center mr-2 mr-md-0'>
          <i className='fas fa-fw fa-download'></i>
        </Button>
      </div> */}
    </Media>
  </Media>
);
Coupon.propTypes = {
  code: PropTypes.string,
  reduction: PropTypes.number,
  mediaClassName: PropTypes.node,
  icon: PropTypes.node,
  iconClassName: PropTypes.node,
  BgIcon: PropTypes.node,
  BgIconClassName: PropTypes.node
};
Coupon.defaultProps = {
  code: '',
  reduction: 0,
  mediaClassName: '',
  icon: 'question',
  iconClassName: 'text-white',
  BgIcon: 'square',
  BgIconClassName: 'text-muted'
};

export { Coupon };
