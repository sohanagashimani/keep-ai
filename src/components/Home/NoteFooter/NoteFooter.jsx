import { Button, Checkbox, Dropdown } from "antd";
import React from "react";
import { AiOutlineMore } from "react-icons/ai";
import When from "../../When/When";

const NoteFooter = ({
  handleDeleteNote,
  handleComplete,
  note,
  handleCancel,
  handleClose,
  isModalOpen,
  isActive,
}) => {
  const items = [
    {
      label: (
        <a
          onClick={() => {
            handleDeleteNote(note);
            handleCancel && handleCancel(false);
          }}
        >
          Delete
        </a>
      ),
      key: "0",
      theme: "dark",
      style: { color: "white" },
    },
  ];
  return (
    <div className="flex justify-between items-center w-full">
      <When isTrue={!isActive}>
        <div
          className={`flex gap-2 justify-end ${
            !isModalOpen ? "ml-auto" : null
          }`}
        >
          <div className="flex items-center pt-1">
            <Checkbox
              type="checkbox"
              onChange={() => handleComplete(note)}
              checked={note?.completed}
            />
          </div>
          <Dropdown menu={{ items }} trigger={["click"]}>
            <div
              className="hover:bg-neutral-700 rounded-full p-3 cursor-pointer"
              onClick={(e) => e.preventDefault()}
            >
              <AiOutlineMore fill="white" />
            </div>
          </Dropdown>
        </div>
      </When>

      <When isTrue={isModalOpen || isActive}>
        <Button
          key="cancel"
          onClick={handleClose}
          type="text"
          className="text-gray-200 text-base px-6 ml-auto"
        >
          Close
        </Button>
      </When>
    </div>
  );
};

export default NoteFooter;
