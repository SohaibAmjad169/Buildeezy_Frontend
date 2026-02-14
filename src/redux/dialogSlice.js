import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  archivedDialogs: [],
  activeDialogs: [],
  loading: false,
};

const dialogSlice = createSlice({
  name: "dialog",
  initialState,
  reducers: {
    setArchivedDialogs: (state, action) => {
      state.archivedDialogs = action.payload;
    },
    setActiveDialogs: (state, action) => {
      state.activeDialogs = action.payload;
    },
    addArchivedDialog: (state, action) => {
      state.archivedDialogs.push(action.payload);
    },
    addActiveDialog: (state, action) => {
      state.activeDialogs.push(action.payload);
    },
    removeArchivedDialog: (state, action) => {
      state.archivedDialogs = state.archivedDialogs.filter(
        (dialog) => dialog.channelId !== action.payload
      );
    },
    removeActiveDialog: (state, action) => {
      state.activeDialogs = state.activeDialogs.filter(
        (dialog) => dialog.channelId !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setArchivedDialogs,
  setActiveDialogs,
  addArchivedDialog,
  addActiveDialog,
  removeArchivedDialog,
  removeActiveDialog,
  setLoading,
} = dialogSlice.actions;

export default dialogSlice.reducer;
