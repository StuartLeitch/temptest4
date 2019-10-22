import { ofType } from "redux-observable";
import { of } from "rxjs";
import { mergeMap } from "rxjs/operators";
// import { ajax } from "rxjs/ajax";

// import {ManuscriptId} from '@hindawi/shared';
// import {all, call, put, takeLatest} from 'redux-saga/effects';
// import {Credential, User} from '../../entities';
// import {updateUserAction} from './user';
// import {SignInInteractor, SignUpInteractor} from '../../useCases';
// import {SampleService} from '../../services';

import CONSTANTS from "./constants";

// * Action Creators
const initAppFulfilled = app => ({
  type: CONSTANTS.INIT_FULFILLED,
  app,
});

interface InitActionType {
  type: string;
  app: any;
}

export const fetchManuscriptAction = (app: any): InitActionType => ({
  type: CONSTANTS.INIT,
  app,
});

// * epic
export const initEpic = (action$: any) =>
  action$.pipe(
    ofType(CONSTANTS.INIT),
    mergeMap((action: InitActionType) => {
      // ajax
      //   .getJSON(`https://api.github.com/users/${action.manuscriptId}`)
      //   .pipe(map(response => fetchManuscriptFulfilled(response))),

      return of(initAppFulfilled({ foo: "bau-bau" }));
    }),
  );
