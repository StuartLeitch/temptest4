import { mergeMap, map } from "rxjs/operators";
import { ofType } from "redux-observable";
const Axios = require("axios-observable").Axios;

import { UserId, UserMap } from "@hindawi/shared";

import CONSTANTS from "./constants";

// * Action Creators
const fetchUserFulfilled = payload => ({
  type: CONSTANTS.FETCH_FULFILLED,
  payload,
});

const fetchUsersFulfilled = payload => ({
  type: CONSTANTS.FETCH_FULFILLED,
  payload,
});

interface UserFetchActionType {
  type: string;
  userId: UserId;
}

interface UsersFetchActionType {
  type: string;
  user?: any;
}

export const fetchUserAction = (userId: UserId): UserFetchActionType => ({
  type: CONSTANTS.FETCH,
  userId,
});

export const fetchUsersAction = (): UsersFetchActionType => ({
  type: CONSTANTS.FETCH,
});

// * epics
// export const fetchUserEpic = (action$: any) =>
//   action$.pipe(
//     ofType(CONSTANTS.FETCH),
//     mergeMap((action: UserFetchActionType) => {
//       // ajax
//       //   .getJSON(`https://api.github.com/users/${action.userId}`)
//       //   .pipe(map(response => fetchUserFulfilled(response))),

//       return;
//       axios({
//         url: "http://localhost:4200/graphql",
//         method: "POST",
//         data: JSON.stringify({ query: "query allPosts { allPosts { id } }" }),
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       })
//         .then(response => {
//           of(fetchUserFulfilled(response.data));
//         })
//         .catch(error => {
//           // observer.error(error);
//         });
//     }),
//   );

export const fetchUsersEpic = (action$: any) =>
  action$.pipe(
    ofType(CONSTANTS.FETCH),
    mergeMap((action: any) =>
      Axios.post(
        "http://localhost:4200/graphql",
        JSON.stringify({ query: "query allUsers { allUsers { id, name, email, role } }" }),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      ).pipe(
        map((response: any) => {
          const user = UserMap.toDomain(response.data.data.allUsers[0]);
          return fetchUsersFulfilled({
            id: user.userId.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          });
        }),
      ),
    ),
  );
