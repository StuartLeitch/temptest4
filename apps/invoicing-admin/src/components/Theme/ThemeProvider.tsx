import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';

import { Provider } from './ThemeContext';

export class ThemeProvider extends React.Component<ThemeProviderProps, ThemeProviderState> {
  static propTypes = {
    children: PropTypes.node,
    initialStyle: PropTypes.string,
    initialColor: PropTypes.string
  };

  constructor(props: ThemeProviderProps) {
    super(props);

    this.state = {
      style: 'light',
      color: 'primary'
    };
  }

  componentDidMount() {
    const { initialStyle, initialColor } = this.props;

    if (initialStyle) {
      this.setState({ style: initialStyle });
    }
    if (initialColor) {
      this.setState({ color: initialColor });
    }
  }

  onChangeTheme(themeState) {
    this.setState(themeState);
  }

  render() {
    const { children } = this.props;

    return (
      <Provider
        value={{
          ...this.state,
          onChangeTheme: this.onChangeTheme.bind(this)
        }}
      >
        {children}
      </Provider>
    );
  }
}

interface ThemeProviderProps {
  children?: ReactNode;
  initialStyle?: string;
  initialColor?: string
};

interface ThemeProviderState {
  style: string;
  color: string;
};
