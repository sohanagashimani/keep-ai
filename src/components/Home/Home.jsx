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
import ChatDrawer from "../Chat/ChatDrawer";
import "./hideScrollbar.css";

const Home = ({ user, setSession, setUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("");
  const { notes, selectedNote, navBarLoader, notesLoader } = useSelector(
    state => state.notes
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
  const [chatDrawerVisible, setChatDrawerVisible] = useState(false);
  useEffect(() => {
    dispatch(handleFetchNotes(refreshNotes, setNotesLoader, 0, 100));
  }, [dispatch]);
  useEffect(() => {
    if (!isEmpty(errors)) {
      Object.values(errors).forEach(error => {
        toast.error(error.message, toastConfig);
      });
    }
  }, [errors]);

  const onRefreshClick = () => {
    dispatch(handleFetchNotes(refreshNotes, setNavBarLoader, 0, 100));
  };

  const updateNote = values => {
    const updatedNote = {
      ...values,
      completed: selectedNote?.completed,
      lastModified: new Date(),
    };
    toggleNoteModal();
    dispatch(handleUpdateNote(updatedNote, selectedNote));
  };

  const addNewNote = note => {
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
  const filteredNotes = notes?.filter(note =>
    note?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "completed") {
      return a.completed === b.completed ? 0 : a.completed ? -1 : 1;
    } else if (sortBy === "created") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === "modified") {
      return new Date(b.lastModified) - new Date(a.lastModified);
    }
    return new Date(b.created_at) - new Date(a.created_at); // Default sort by created date
  });

  const toggleNoteModal = () => {
    setIsModalOpen(prev => !prev);
  };

  const handleNoteSelection = note => {
    dispatch(selectNote(note));
  };

  const deleteNote = note => {
    dispatch(handleDeleteNote(note));
  };
  const completeNote = note => {
    const updatedNote = {
      ...note,
      completed: !note.completed,
      lastModified: new Date(),
    };
    dispatch(handleUpdateNote(updatedNote, note));
  };

  return (
    <div className="flex w-full h-screen overflow-x-hidden gap-x-6 md:bg-neutral-900 items-start md:p-2">
      <div
        id="main-content"
        className="flex-grow min-w-0 transition-all duration-300 ease-in-out pt-2 bg-neutral-800 flex flex-col gap-2  h-full md:rounded-2xl shadow-lg"
        style={{ color: "#e8eaed" }}
      >
        <When isTrue={notesLoader}>
          <div className="h-full flex flex-row items-center justify-center">
            <Spinner spinning={notesLoader} />
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
                chatDrawerVisible,
                setChatDrawerVisible,
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
          <div className="flex-1 overflow-y-auto md:p-4 space-y-4  bg-neutral-800 hide-scrollbar md:rounded-b-2xl">
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
                  chatDrawerVisible,
                }}
              />
            </When>
          </div>
        </When>
      </div>
      {chatDrawerVisible && (
        <div
          className="w-[700px] h-full flex-shrink-0 rounded-2xl shadow-lg bg-[#1a1a1a] animate-slide-in"
          style={{
            animation: "slideIn 3s ease-out",
          }}
        >
          <ChatDrawer
            visible={chatDrawerVisible}
            onClose={() => setChatDrawerVisible(false)}
            handleRefresh={onRefreshClick}
            asFlex
          />
        </div>
      )}
    </div>
  );
};

export default Home;
