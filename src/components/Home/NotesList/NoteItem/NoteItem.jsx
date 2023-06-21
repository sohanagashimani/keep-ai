import { useState } from "react";
import NoteFooter from "../../NoteFooter/NoteFooter";
import When from "../../../When/When";
import { useMediaQuery } from "react-responsive";

const NoteItem = ({
  note,
  setSelectedNote,
  showModal,
  reset,
  handleDeleteNote,
  handleComplete,
}) => {
  const { title, content, completed } = note;
  const [showFooter, setShowFooter] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 1000 });

  return (
    <div
      className={`bg-transparent rounded-lg hover:shadow-md p-4 border ${
        completed ? "border-blue-600" : "border-neutral-500 "
      } mb-3 relative `}
      onMouseEnter={() => setShowFooter(true)}
      onMouseLeave={() => setShowFooter(false)}
    >
      <div
        className="pb-14"
        onClick={() => {
          setSelectedNote(note);
          reset({ ...note });
          showModal();
        }}
      >
        <p className="text-lg font-semibold mb-2 break-all">{title}</p>
        <p className="whitespace-pre-line break-all">{content}</p>
      </div>
      <div className="absolute bottom-2 right-2 w-full pl-4">
        <When isTrue={showFooter || isMobile}>
          <NoteFooter
            {...{
              handleDeleteNote,
              handleComplete,
              note,
            }}
          />
        </When>
      </div>
    </div>
  );
};

export default NoteItem;
