import { combineEpics } from 'redux-observable';
import payerEpics from '../modules/payer/epics';

export default combineEpics(...payerEpics);
