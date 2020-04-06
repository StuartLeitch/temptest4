import { SetStateAction, Dispatch } from 'react';
import { FetchData } from 'graphql-hooks';

import { RemindersPauseState, ToggleResponse } from './types';

export function onToggle(
  updateLoading: Dispatch<SetStateAction<boolean>>,
  updateError: Dispatch<SetStateAction<unknown>>,
  updateData: Dispatch<SetStateAction<RemindersPauseState>>,
  id: string
) {
  return (mutation: FetchData<ToggleResponse>, field: string) => {
    return (newState: boolean) => {
      updateLoading(true);
      mutation({
        variables: {
          id,
          state: !newState,
        },
      }).then((response) => {
        const { data, loading, error } = response;

        updateLoading(loading);
        updateError(error);
        updateData(data[field]);
      });
    };
  };
}
