import {FlexboxProps, LayoutProps, SpaceProps} from 'styled-system';
import React, {ReactNode, useState} from 'react';

import {ExpansionPanel as Root} from './ExpansionPanel.styles';
import ExpansionTitle from './ExpansionTitle';

export interface Props extends SpaceProps, LayoutProps, FlexboxProps {
  children: ReactNode;
  expanded?: boolean;
  title: string;
  onClick?(e: boolean): void;
}

const getComponentState = (
  onClick: (e: boolean) => void | null,
  expanded: boolean
): [boolean, (e: boolean) => void] => {
  if (onClick) {
    return [expanded, onClick];
  } else {
    const [a, b] = useState(expanded);
    return [a, b];
  }
};

const ExpansionPanel: React.FunctionComponent<Props> = ({
  children,
  expanded,
  title,
  onClick,
  ...rest
}) => {
  const [expandedState, setExpandedState] = getComponentState(
    onClick,
    expanded
  );

  return (
    <Root expanded={expandedState} {...rest}>
      <ExpansionTitle
        expanded={expandedState}
        title={title}
        onClick={() => setExpandedState(!expandedState)}
      ></ExpansionTitle>
      {expandedState ? children : null}
    </Root>
  );
};

ExpansionPanel.defaultProps = {
  children: null,
  title: '',
  onClick: null
};

export default ExpansionPanel;
