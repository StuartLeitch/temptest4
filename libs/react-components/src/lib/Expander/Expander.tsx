import { FlexboxProps, LayoutProps, SpaceProps } from 'styled-system';
import React, { ReactNode, useState, useEffect } from 'react';

import { Expander as Root } from './Expander.styles';
import ExpansionTitle from './ExpansionTitle';

export interface Props extends SpaceProps, LayoutProps, FlexboxProps {
  children: ReactNode;
  title: string;
  expanded?: boolean;
  disabled?: boolean;
  iconSize?: number;
  onClick?(e: boolean): void;
}

const getComponentState = (
  onClick: (e: boolean) => void | null,
  expanded: boolean
): [boolean, (e: boolean) => void] => {
  if (onClick) {
    return [expanded, onClick];
  } else {
    return useState(expanded);
  }
};

const Expander: React.FunctionComponent<Props> = ({
  children,
  expanded,
  title,
  onClick,
  iconSize,
  disabled,
  ...rest
}) => {
  const [expandedState, setExpandedState] = getComponentState(
    onClick,
    expanded
  );
  useEffect(() => {
    setExpandedState(!disabled && expandedState);
  }, [disabled]);

  return (
    <Root expanded={expandedState} {...rest}>
      <ExpansionTitle
        title={title}
        iconSize={iconSize}
        expanded={expandedState}
        disabled={disabled}
        onClick={() => setExpandedState(!disabled && !expandedState)}
      />
      {expandedState ? children : null}
    </Root>
  );
};

Expander.defaultProps = {
  children: null,
  title: '',
  onClick: null,
  iconSize: 6,
  disabled: false
};

export default Expander;
