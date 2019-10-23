import { ofType } from "redux-observable";
import { mergeMap, map } from "rxjs/operators";
const Axios = require("axios-observable").Axios;

import { ManuscriptId, ArticleMap } from "@hindawi/shared";

import CONSTANTS from "./constants";

// * Action Creators
const fetchManuscriptFulfilled = payload => ({
  type: CONSTANTS.FETCH_FULFILLED,
  payload,
});

interface ManuscriptFetchActionType {
  type: string;
  manuscriptId?: ManuscriptId;
}

export const fetchManuscriptAction = (): ManuscriptFetchActionType => ({
  type: CONSTANTS.FETCH,
});

// * epic
export const fetchManuscriptEpic = (action$: any) =>
  action$.pipe(
    ofType(CONSTANTS.FETCH),
    mergeMap((action: ManuscriptFetchActionType) =>
      Axios.post(
        "http://localhost:4200/graphql",
        JSON.stringify({
          query:
            "query allManuscripts { allManuscripts { id, title, articleTypeId, authorEmail, authorCountry, authorSurname } }",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      ).pipe(
        map((response: any) => {
          const manuscript = ArticleMap.toDomain(response.data.data.allManuscripts[0]);
          return fetchManuscriptFulfilled({
            id: manuscript.manuscriptId.id.toString(),
            ...manuscript.props,
          });
        }),
      ),
    ),
  );
