import React from 'react';
import {render, cleanup} from '@testing-library/react';

import ReactComponents from './react-components';

describe(' ReactComponents', () => {
  afterEach(cleanup);

  it('should render successfully', () => {
    const {baseElement} = render(<ReactComponents />);
    expect(baseElement).toBeTruthy();
  });
});
