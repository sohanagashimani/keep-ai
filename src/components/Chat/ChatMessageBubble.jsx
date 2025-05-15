import React from "react";

const ChatMessageBubble = ({ message }) => {
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
      {message.content}
    </div>
  );
};

export default ChatMessageBubble;
