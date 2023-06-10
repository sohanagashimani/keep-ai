import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notes: [],
  selectedNote: null,
  navBarLoader: false,
  notesLoader: false,
};

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    refreshNotes: (state, action) => {
      state.notes = action.payload;
    },
    setNotes: (state, action) => {
      return { ...state, notes: [...state.notes, ...action.payload] };
    },
    selectNote: (state, action) => {
      state.selectedNote = action.payload;
    },
    addNote: (state, action) => {
      state.notes.push(action.payload);
    },
    updateNote: (state, action) => {
      const updatedNote = action.payload;
      const index = state.notes.findIndex((note) => note.id === updatedNote.id);
      if (index !== -1) {
        state.notes[index] = { ...state.notes[index], ...updatedNote };
        if (state.selectedNote && state.selectedNote.id === updatedNote.id) {
          state.selectedNote = { ...state.notes[index] };
        }
      }
    },
    deleteNote: (state, action) => {
      const noteId = action.payload;
      const index = state.notes.findIndex((note) => note.id === noteId);
      if (index !== -1) {
        state.notes.splice(index, 1);
      }
    },
    setNavBarLoader: (state, action) => {
      state.navBarLoader = action.payload;
    },
    setNotesLoader: (state, action) => {
      state.notesLoader = action.payload;
    },
  },
});

export const {
  setNotes,
  addNote,
  updateNote,
  deleteNote,
  selectNote,
  setNavBarLoader,
  setUser,
  setNotesLoader,
  refreshNotes,
  setUserLoader,
} = noteSlice.actions;

export default noteSlice.reducer;
