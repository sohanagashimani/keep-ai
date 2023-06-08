import { Input } from "antd";
import { Controller } from "react-hook-form";
import React, { useEffect, useRef } from "react";
import NoteFooter from "../NoteFooter/NoteFooter";
import When from "../../When/When";

const NoteForm = ({
  handleOutsideClick,
  control,
  isActive,
  handleKeyDown,
  maxRows = 14,
}) => {
  const formRef = useRef(null);
  const { TextArea } = Input;
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  const onOutsideClick = (event) => {
    if (!formRef.current || !formRef.current.contains(event.target)) {
      handleOutsideClick && handleOutsideClick();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", onOutsideClick);
    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
    };
  });

  const handleTitleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      contentRef.current.focus();
    }
  };

  return (
    <form ref={formRef} onKeyDown={handleKeyDown}>
      <div className=" mb-2">
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className="w-full mb-2 bg-transparent outline-none focus:outline-none placeholder-neutral-500 p-0 text-gray-200 text-lg font-semibold"
              placeholder="Title"
              bordered={false}
              onKeyDown={handleTitleKeyDown}
              ref={(ref) => {
                field.ref(ref);
                titleRef.current = ref;
              }}
            />
          )}
        />
      </div>
      <div>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              className="w-full resize-none bg-transparent outline-none focus:outline-none placeholder-neutral-500 p-0 text-gray-200 text-lg"
              placeholder="Take a note..."
              autoSize={{ minRows: 2, maxRows }}
              bordered={false}
              ref={(ref) => {
                field.ref(ref);
                contentRef.current = ref;
              }}
            />
          )}
        />
      </div>
      <When isTrue={isActive}>
        <NoteFooter
          {...{
            isActive,
            handleClose: handleOutsideClick,
          }}
        />
      </When>
    </form>
  );
};

export default NoteForm;
