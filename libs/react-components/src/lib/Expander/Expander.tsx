import {FlexboxProps, LayoutProps, SpaceProps} from 'styled-system';
import React, {ReactNode, useState} from 'react';

import {Expander as Root} from './Expander.styles';
import ExpansionTitle from './ExpansionTitle';

export interface Props extends SpaceProps, LayoutProps, FlexboxProps {
  children: ReactNode;
  title: string;
  expanded?: boolean;
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
  ...rest
}) => {
  const [expandedState, setExpandedState] = getComponentState(
    onClick,
    expanded
  );

  return (
    <Root expanded={expandedState} {...rest}>
      <ExpansionTitle
        title={title}
        iconSize={iconSize}
        expanded={expandedState}
        onClick={() => setExpandedState(!expandedState)}
      />
      {expandedState ? children : null}
    </Root>
  );
};

Expander.defaultProps = {
  children: null,
  title: '',
  onClick: null,
  iconSize: 6
};

export default Expander;
