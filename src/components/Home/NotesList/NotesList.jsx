import { breakpointColumns } from "@/config/breakpointColumns";
import React from "react";
import Masonry from "react-masonry-css";
import NoteModal from "./NoteModal/NoteModal";
import When from "../../When/When";
import NoteItem from "./NoteItem/NoteItem";
import { useDispatch } from "react-redux";
import { toastConfig } from "@/config/toastConfig";
import { handleFetchNotes } from "@/handlers/noteHandlers";
import { length } from "ramda";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "react-toastify";
import { setNotes } from "@/store/noteSlice";

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
  setNavBarLoader,
  isDirty,
  setHasMore,
  hasMore,
  refreshNotes,
}) => {
  const dispatch = useDispatch();
  const fetchMore = async () => {
    await dispatch(
      handleFetchNotes(setNotes, setNavBarLoader, length(sortedNotes), 10)
    ).then((res) => {
      setHasMore(res);
      if (!res) toast.info("No more notes to load", toastConfig);
    });
  };
  return (
    <InfiniteScroll
      dataLength={sortedNotes.length}
      next={fetchMore}
      hasMore={hasMore}
      refreshFunction={refreshNotes}
      pullDownToRefresh
      pullDownToRefreshThreshold={50}
      pullDownToRefreshContent={
        <p style={{ textAlign: "center" }}>&#8595; Pull down to refresh</p>
      }
      releaseToRefreshContent={
        <p style={{ textAlign: "center" }}>&#8593; Release to refresh</p>
      }
      hasChildren={true}
      endMessage={
        <p className="flex justify-center py-2">Yay! You have seen it all</p>
      }
    >
      <div className="flex justify-center mx-3 md:mx-28">
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
    </InfiniteScroll>
  );
};

export default NotesList;
