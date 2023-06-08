import { toastConfig } from "@/config/toastConfig";
import {
  addNote,
  deleteNote,
  setNavBarLoader,
  setNotes,
  updateNote,
} from "@/store/noteSlice";
import { supabase } from "@/utils/supabase";
import axios from "axios";
import { toast } from "react-toastify";

export const handleAddNote = (newNote) => {
  return async (dispatch) => {
    dispatch(setNavBarLoader(true));
    dispatch(
      addNote({
        ...newNote,
        lastModified: newNote.lastModified.toISOString(),
        created_at: new Date().toISOString(),
      })
    );
    try {
      const response = await axios.post(`/api/notes`, newNote);
      if (response.status !== 200) {
        toast.error("Something went wrong, please try again", toastConfig);
        dispatch(deleteNote(newNote.id));
      }
      dispatch(setNavBarLoader(false));
    } catch (error) {
      toast.error("Something went wrong, please try again", toastConfig);
      dispatch(setNavBarLoader(false));
      throw new Error(error);
    }
  };
};
export const handleFetchNotes = (loader) => {
  return async (dispatch) => {
    dispatch(loader(true));
    try {
      const response = await axios.get(`/api/notes`);
      dispatch(setNotes(response.data));
      dispatch(loader(false));
    } catch (error) {
      dispatch(loader(false));
      throw new Error(error);
    }
  };
};
export const handleDeleteNote = (note) => {
  return async (dispatch) => {
    dispatch(setNavBarLoader(true));
    dispatch(deleteNote(note.id));
    try {
      await supabase.from("notes").delete().eq("id", note.id);
      dispatch(setNavBarLoader(false));
    } catch (error) {
      dispatch(setNavBarLoader(false));
      throw new Error(error);
    }
  };
};
export const handleCompleteNote = (note) => {
  const updatedNote = {
    ...note,
    completed: !note.completed,
    lastModified: new Date(),
  };
  return async (dispatch) => {
    dispatch(setNavBarLoader(true));
    dispatch(
      updateNote({
        ...updatedNote,
        lastModified: updatedNote.lastModified.toISOString(),
      })
    );
    try {
      const response = await axios.put(`/api/notes`, { ...updatedNote });
      if (response.status !== 200) {
        dispatch(updateNote(note));

        toast.error("Something went wrong, please try again", toastConfig);
      }
      dispatch(setNavBarLoader(false));
    } catch (error) {
      dispatch(setNavBarLoader(false));
      throw new Error(error);
    }
  };
};
export const handleUpdateNote = (
  updatedNote,
  toggleNoteModal,
  selectedNote
) => {
  return async (dispatch) => {
    dispatch(setNavBarLoader(true));
    dispatch(
      updateNote({
        ...updatedNote,
        lastModified: updatedNote.lastModified.toISOString(),
      })
    );
    toggleNoteModal();

    try {
      const response = await axios.put(`/api/notes`, {
        ...updatedNote,
      });
      if (response.status !== 200) {
        dispatch(
          updateNote({
            ...selectedNote,
          })
        );
        toast.error("Something went wrong, please try again", toastConfig);
      }
      dispatch(setNavBarLoader(false));
    } catch (error) {
      dispatch(setNavBarLoader(false));
      throw new Error(error);
    }
  };
};
