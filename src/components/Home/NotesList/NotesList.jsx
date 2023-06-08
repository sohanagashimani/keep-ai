import { breakpointColumns } from "@/config/breakpointColumns";
import React from "react";
import Masonry from "react-masonry-css";
import NoteModal from "./NoteModal/NoteModal";
import When from "../../When/When";
import NoteItem from "./NoteItem/NoteItem";

const NotesList = ({
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
}) => {
  return (
    <div className="flex justify-center mx-3 md:mx-4">
      <Masonry
        breakpointCols={breakpointColumns}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {sortedNotes?.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            setSelectedNote={handleNoteSelection}
            showModal={toggleNoteModal}
            reset={reset}
            handleDeleteNote={deleteNote}
            handleComplete={completeNote}
          />
        ))}
        <When isTrue={isModalOpen}>
          <NoteModal
            {...{
              isModalOpen,
              handleCancel: toggleNoteModal,
              selectedNote,
              handleUpdateNote: updateNote,
              control,
              handleSubmit,
              isDirty,
              handleComplete: completeNote,
              handleDeleteNote: deleteNote,
            }}
          />
        </When>
      </Masonry>
    </div>
  );
};

export default NotesList;
