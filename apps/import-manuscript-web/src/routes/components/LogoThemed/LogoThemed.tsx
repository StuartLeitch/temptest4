import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// import { ThemeConsumer } from '../../../components/Theme';

const logos = {
  primary: require('./../../../assets/images/logos/hindawi.svg'),
  // white: require('./../../../assets/images/logos/logo-white.svg'),
  // success: require('./../../../assets/images/logos/logo-success.svg'),
  // warning: require('./../../../assets/images/logos/logo-warning.svg'),
  // danger: require('./../../../assets/images/logos/logo-danger.svg'),
  // info: require('./../../../assets/images/logos/logo-info.svg'),
  // indigo: require('./../../../assets/images/logos/logo-indigo.svg'),
  // purple: require('./../../../assets/images/logos/logo-purple.svg'),
  // pink: require('./../../../assets/images/logos/logo-pink.svg'),
  // yellow: require('./../../../assets/images/logos/logo-yellow.svg')
};

const getLogoUrl = (style, color) => {
  return logos[color].default;
};

// Check for background
const getLogoUrlBackground = () => {
  return logos['primary'].default;
};

const LogoThemed: React.FC<LogoThemedProps> = ({ checkBackground, className, ...otherProps }) => (
  <div className={'logoContainer'}>
      <img
        src={getLogoUrlBackground()}
        className={classNames('logo d-block', className)}
        alt='Hindawi Logo'
        {...otherProps}
      />
  </div>
);
LogoThemed.propTypes = {
  checkBackground: PropTypes.bool,
  className: PropTypes.string
};

interface LogoThemedProps {
  checkBackground?: boolean;
  className?: string;
};

export { LogoThemed };
