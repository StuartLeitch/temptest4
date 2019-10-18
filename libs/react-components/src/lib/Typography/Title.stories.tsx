import * as React from 'react';

import Title from './Title';

export const Hero = () => (
  <React.Fragment>
    <Title mb={4} type="hero">
      Hero Title
    </Title>
    <Title upper mb={4} type="hero">
      Hero Uppercase Title
    </Title>
    <Title mb={4} type="hero">
      Hero No Ellipsis for an Unnecessary Long Title Just To See How Things Look
      And Wrap Around If They Need To Wrap Around And Not Look Bad
    </Title>
    <Title type="hero" ellipsis>
      Hero Ellipsis for an Unnecessary Long Title Just To See How Things Look
      And Wrap Around If They Need To Wrap Around And Not Look Bad
    </Title>
  </React.Fragment>
);

export const Primary = () => (
  <React.Fragment>
    <Title mb={4} type="primary">
      Primary Title
    </Title>
    <Title upper mb={4} type="primary">
      Primary Uppercase Title
    </Title>
    <Title mb={4} type="primary">
      Primary No Ellipsis for an Unnecessary Long Title Just To See How Things
      Look And Wrap Around If They Need To Wrap Around And Not Look Bad
    </Title>
    <Title type="primary" ellipsis>
      Primary Ellipsis for an Unnecessary Long Title Just To See How Things Look
      And Wrap Around If They Need To Wrap Around And Not Look Bad
    </Title>
  </React.Fragment>
);

export const Small = () => (
  <React.Fragment>
    <Title mb={4} type="small">
      Small Title
    </Title>
    <Title upper mb={4} type="small">
      Small Uppercase Title
    </Title>
    <Title mb={4} type="small">
      Small No Ellipsis for an Unnecessary Long Title Just To See How Things
      Look And Wrap Around If They Need To Wrap Around And Not Look Bad
    </Title>
    <Title type="small" ellipsis>
      Small Ellipsis for an Unnecessary Long Title Just To See How Things Look
      And Wrap Around If They Need To Wrap Around And Not Look Bad
    </Title>
  </React.Fragment>
);

export default {
  title: 'Title',
  component: Title
};
