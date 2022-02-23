import { createSlice } from '@reduxjs/toolkit'

export const uploadSlice = createSlice({
  name: 'upload',
  initialState: {
    zip: null,
  },
  reducers: {
    upload: (state, action) => {
      state.zip = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { upload } = uploadSlice.actions

export default uploadSlice.reducer
