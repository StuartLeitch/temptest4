import {ofType} from 'redux-observable';
import {mergeMap, map} from 'rxjs/operators';
import {ajax} from 'rxjs/ajax';

import {ManuscriptId} from '@hindawi/shared';

// import {all, call, put, takeLatest} from 'redux-saga/effects';
// import {Credential, User} from '../../entities';
// import {updateUserAction} from './user';
// import {SignInInteractor, SignUpInteractor} from '../../useCases';
// import {SampleService} from '../../services';

import CONSTANTS from './constants';

// * Action Creators
const fetchManuscriptFulfilled = payload => ({
  type: CONSTANTS.FETCH_FULFILLED,
  payload
});

interface ManuscriptFetchActionType {
  type: string;
  manuscriptId: ManuscriptId;
}

export const fetchManuscriptAction = (
  manuscriptId: ManuscriptId
): ManuscriptFetchActionType => ({
  type: CONSTANTS.FETCH,
  manuscriptId
});

// * epic
export const fetchManuscriptEpic = (action$: any) =>
  action$.pipe(
    ofType(CONSTANTS.FETCH),
    mergeMap((action: ManuscriptFetchActionType) =>
      ajax
        .getJSON(`https://api.github.com/users/${action.manuscriptId}`)
        .pipe(map(response => fetchManuscriptFulfilled(response)))
    )
  );
