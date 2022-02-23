import { configureStore } from '@reduxjs/toolkit';
import uploadReducer from './uploadSlice';

export default configureStore({
  reducer: {
    upload: uploadReducer
  },
})
