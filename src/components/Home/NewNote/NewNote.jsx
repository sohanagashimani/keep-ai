import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import When from "../../When/When";
import noteFormSchema from "@/schemas/NoteForm.validations";
import NoteForm from "../NoteForm/NoteForm";
import { isEmpty } from "ramda";
import { toast } from "react-toastify";
import { toastConfig } from "@/config/toastConfig";
import { shouldCloseNewNoteContainer } from "@/utils/shouldCloseNewNoteContainer";

const NewNote = ({ onSubmit }) => {
  const [isActive, setIsActive] = useState(false);
  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(noteFormSchema),
  });
  const handleClick = () => {
    !isActive && setIsActive((prev) => !prev);
  };
  useEffect(() => {
    if (!isEmpty(errors)) {
      Object.values(errors).forEach((error) => {
        toast.error(error.message, { ...toastConfig });
      });
    }
  }, [errors]);
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      if (shouldCloseNewNoteContainer(isActive, isDirty, getValues)) {
        setIsActive(false);
      } else {
        handleSubmit(handleFormSubmit)();
      }
    }
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
    setIsActive(false);
  };
  const handleOutsideClick = () => {
    if (shouldCloseNewNoteContainer(isActive, isDirty, getValues)) {
      setIsActive((prev) => !prev);
    } else {
      handleSubmit(handleFormSubmit)();
    }
  };
  return (
    <div className="flex justify-start md:justify-center mx-3 md:mx-0 pt-1 lg:pt-5">
      <div
        className={`rounded-lg p-3 ${
          isActive ? "h-auto" : "h-min"
        } transition-all duration-500 focus:outline-none mb-6 lg:w-2/5 md:w-3/5 w-11/12`}
        onClick={handleClick}
        style={{
          boxShadow:
            "0 1px 2px 0 rgba(0,0,0,0.6), 0 2px 6px 2px rgba(0,0,0,0.302)",
          border: "1px solid #5f6368",
        }}
        onKeyDown={(e) => {
          e.key === "Escape" && isActive && !isDirty && setIsActive(false);
        }}
        tabIndex={0}
      >
        <When isTrue={isActive}>
          <NoteForm
            {...{
              isActive,
              handleKeyDown,
              handleOutsideClick,
              handleSubmit,
              control,
            }}
          />
        </When>
        <When isTrue={!isActive}>
          <span className="cursor-pointer">Take a note...</span>
        </When>
      </div>
    </div>
  );
};

export default NewNote;
