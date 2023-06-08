import { configureStore } from "@reduxjs/toolkit";
import noteReducer from "./noteSlice";

const store = configureStore({
  reducer: {
    notes: noteReducer,
  },
});

export default store;
