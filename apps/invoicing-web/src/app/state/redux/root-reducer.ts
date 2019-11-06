import { combineReducers } from 'redux';

import payerReducer from '../modules/payer/reducers';

const rootReducer = combineReducers({
  payer: payerReducer,
});

export default rootReducer;
