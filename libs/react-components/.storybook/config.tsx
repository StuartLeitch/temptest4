import React from 'react';
import {withA11y} from '@storybook/addon-a11y';
import {withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {ThemeProvider} from 'styled-components';
import {addDecorator, configure} from '@storybook/react';

import theme from '../src/lib/Theme';

addDecorator(withKnobs);
addDecorator(withA11y);
addDecorator(withNotes);
addDecorator(story => <ThemeProvider theme={theme}>{story()}</ThemeProvider>);

configure(require.context('../src', true, /\.stories\.tsx?$/), module);
