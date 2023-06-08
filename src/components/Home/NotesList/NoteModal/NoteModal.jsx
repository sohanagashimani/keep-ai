import { getFormattedDate } from "@/utils/getFormattedDate";
import { Modal, Tooltip } from "antd";
import React from "react";
import NoteForm from "../../NoteForm/NoteForm";
import NoteFooter from "../../NoteFooter/NoteFooter";

const NoteModal = ({
  isModalOpen,
  handleCancel,
  handleSubmit,
  handleUpdateNote,
  selectedNote,
  control,
  handleDeleteNote,
  handleComplete,
  isDirty,
}) => {
  const handleOnClose = () => {
    if (isDirty) {
      handleSubmit(handleUpdateNote)();
    } else {
      handleCancel();
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleOnClose();
    }
  };
  return (
    <Modal
      open={isModalOpen}
      keyboard={!isDirty}
      onCancel={handleOnClose}
      closable={false}
      footer={[
        <div key={0}>
          <NoteFooter
            {...{
              handleDeleteNote,
              isModalOpen,
              note: selectedNote,
              handleCancel,
              handleComplete,
              handleClose: handleOnClose,
            }}
          />
        </div>,
      ]}
    >
      <NoteForm
        {...{
          handleFormSubmit: handleUpdateNote,
          handleSubmit,
          control,
          isDirty,
          handleKeyDown,
          maxRows: 19,
        }}
      />
      <div className="flex justify-end text-gray-200">
        <Tooltip
          title={`Created ${getFormattedDate(selectedNote?.created_at)}`}
          color="#525252"
          arrow={false}
          overlayInnerStyle={{
            fontSize: "12px",
            marginRight: "10px",
          }}
          mouseEnterDelay={0.2}
        >
          <p className="ml-auto text-xs cursor-default py-1">
            Edited {getFormattedDate(selectedNote?.lastModified)}
          </p>
        </Tooltip>
      </div>
    </Modal>
  );
};

export default NoteModal;
