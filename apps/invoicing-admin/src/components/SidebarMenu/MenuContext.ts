/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';

const MenuContext = React.createContext({
    entries: { },
    addEntry: () => { },
    updateEntry: () => { },
    removeEntry: () => { }
});

export { MenuContext };
