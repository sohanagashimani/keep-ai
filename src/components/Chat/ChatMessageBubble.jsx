import React from "react";

const ChatMessageBubble = ({ message }) => {
  // Replace newlines with <br /> for proper rendering
  const formattedContent = message.content
    ? message.content.split("\n").map((line, idx) => (
        <React.Fragment key={idx}>
          {line}
          {idx !== message.content.split("\n").length - 1 && <br />}
        </React.Fragment>
      ))
    : null;

  return (
    <div
      className={`w-fit max-w-[90vw] sm:max-w-[80%] rounded-2xl p-3 text-sm sm:text-base break-words shadow-none transition-all
        ${
          message.role === "user"
            ? "bg-blue-600 text-white ml-auto"
            : "bg-neutral-800 text-gray-200 border border-gray-700 mr-auto"
        }
      `}
    >
      {formattedContent}
    </div>
  );
};

export default ChatMessageBubble;
