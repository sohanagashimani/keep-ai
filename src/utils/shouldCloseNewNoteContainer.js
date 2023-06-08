import { isEmpty, isNil } from "ramda";

export const shouldCloseNewNoteContainer = (isActive, isDirty, getValues) => {
  const isTitleEmpty = isEmpty(getValues("title"));
  const isContentEmpty = isEmpty(getValues("content"));
  const isTitleNil = isNil(getValues("title"));
  const isContentNil = isNil(getValues("content"));

  return (
    isActive &&
    (!isDirty ||
      (isContentEmpty && isTitleNil) ||
      (isTitleEmpty && isContentNil) ||
      (isTitleEmpty && isContentEmpty))
  );
};
