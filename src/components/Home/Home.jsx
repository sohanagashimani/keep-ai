import React, { useState, useEffect } from "react";
import { Empty } from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  refreshNotes,
  selectNote,
  setNavBarLoader,
  setNotesLoader,
} from "../../store/noteSlice";
import { SlTrash } from "react-icons/sl";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import noteFormSchema from "@/schemas/NoteForm.validations";
import { toast } from "react-toastify";
import { toastConfig } from "@/config/toastConfig";
import When from "../When/When";
import NewNote from "./NewNote/NewNote";
import isEmpty from "ramda/src/isEmpty";
import Spinner from "../Spinner/Spinner";
import FilterNotes from "./FilterNotes/FilterNotes";
import {
  handleAddNote,
  handleDeleteNote,
  handleFetchNotes,
  handleUpdateNote,
} from "@/handlers/noteHandlers";
import NotesList from "./NotesList/NotesList";
import Header from "./Header/Header";
import { supabase } from "@/utils/supabase";
import { length } from "ramda";

const Home = ({ user, setSession, setUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("");
  const { notes, selectedNote, navBarLoader, notesLoader } = useSelector(
    (state) => state.notes
  );
  const dispatch = useDispatch();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(noteFormSchema),
    defaultValues: {
      title: selectedNote?.title || "",
      content: selectedNote?.content || "",
    },
  });
  useEffect(() => {
    dispatch(handleFetchNotes(refreshNotes, setNotesLoader, 0, 100));
  }, [dispatch]);
  useEffect(() => {
    if (!isEmpty(errors)) {
      Object.values(errors).forEach((error) => {
        toast.error(error.message, toastConfig);
      });
    }
  }, [errors]);

  const onRefreshClick = () => {
    dispatch(handleFetchNotes(refreshNotes, setNavBarLoader, 0, 100));
  };

  const updateNote = (values) => {
    const updatedNote = {
      ...values,
      completed: selectedNote?.completed,
      lastModified: new Date(),
    };
    toggleNoteModal();
    dispatch(handleUpdateNote(updatedNote, selectedNote));
  };

  const addNewNote = (note) => {
    const newNote = {
      ...note,
      lastModified: new Date(),
      id: uuidv4(),
    };
    dispatch(handleAddNote(newNote));
  };

  const handleLogout = async () => {
    dispatch(setNavBarLoader(true));
    const { error } = await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    dispatch(setNavBarLoader(false));
    if (error) {
      dispatch(setNavBarLoader(false));
      throw new Error(error);
    }
  };
  const filteredNotes = notes?.filter((note) =>
    note?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (
      sortBy === "completed" &&
      filteredNotes.some((note) => note.completed)
    ) {
      return a.completed === b.completed ? 0 : a.completed ? -1 : 1;
    }
    return b.created_at.localeCompare(a.created_at);
  });

  const toggleNoteModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleNoteSelection = (note) => {
    dispatch(selectNote(note));
  };

  const deleteNote = (note) => {
    dispatch(handleDeleteNote(note));
  };
  const completeNote = (note) => {
    const updatedNote = {
      ...note,
      completed: !note.completed,
      lastModified: new Date(),
    };
    dispatch(handleUpdateNote(updatedNote, note));
  };

  return (
    <div
      className=" pt-2 bg-neutral-800 flex flex-col gap-2 w-full"
      style={{ color: "#e8eaed" }}
    >
      <When isTrue={notesLoader}>
        <div className="h-screen flex flex-row items-center justify-center">
          <div className="flex flex-col">
            <Spinner spinning={notesLoader} />
          </div>
        </div>
      </When>
      <When isTrue={!notesLoader}>
        <div className="mx-3">
          <Header
            {...{
              setSearchTerm,
              searchTerm,
              setSortBy,
              sortBy,
              handleLogout,
              navBarLoader,
              handleRefresh: onRefreshClick,
              user,
            }}
          />
        </div>
        <div className="border-b border-neutral-500"></div>
        <div className="md:hidden">
          <FilterNotes
            {...{
              setSortBy,
              sortBy,
            }}
          />
        </div>
        <NewNote onSubmit={addNewNote} />
        <When isTrue={isEmpty(sortedNotes)}>
          <div className="flex justify-center items-center h-full text-white">
            <Empty
              image={<SlTrash size={30} />}
              description={
                <p className="text-gray-200 -mt-6">No notes to display</p>
              }
            />
          </div>
        </When>
        <When isTrue={!isEmpty(sortedNotes)}>
          <NotesList
            {...{
              sortedNotes,
              handleNoteSelection,
              toggleNoteModal,
              reset,
              deleteNote,
              completeNote,
              updateNote,
              selectedNote,
              isModalOpen,
              control,
              handleSubmit,
              isDirty,
              setNavBarLoader,
              setHasMore,
              hasMore,
              refreshNotes: onRefreshClick,
            }}
          />
        </When>
      </When>
    </div>
  );
};

export default Home;
