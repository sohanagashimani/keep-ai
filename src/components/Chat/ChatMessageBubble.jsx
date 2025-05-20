import React from "react";

const ChatMessageBubble = ({ message }) => {
  // Format the content with proper spacing and styling
  const formatContent = content => {
    if (!content) return null;

    // Split content into sections based on double newlines
    const sections = content.split("\n\n");

    return sections.map((section, sectionIdx) => {
      // Split each section into lines
      const lines = section.split("\n");

      return (
        <div key={sectionIdx} className="mb-2 last:mb-0">
          {lines.map((line, lineIdx) => {
            // Check if line is a list item
            if (line.match(/^\d+\./)) {
              return (
                <div key={lineIdx} className="ml-4">
                  {line}
                </div>
              );
            }
            // Check if line is a bullet point
            else if (line.startsWith("-")) {
              return (
                <div key={lineIdx} className="ml-4">
                  {line}
                </div>
              );
            }
            // Regular line
            return (
              <React.Fragment key={lineIdx}>
                {line}
                {lineIdx !== lines.length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div
      className={`w-fit max-w-[90vw] sm:max-w-[80%] rounded-2xl p-4 text-sm sm:text-base break-words shadow-none transition-all
        ${
          message.role === "user"
            ? "bg-blue-600 text-white ml-auto"
            : "bg-neutral-800 text-gray-200 border border-gray-700 mr-auto"
        }
      `}
    >
      {formatContent(message.content)}
    </div>
  );
};

export default ChatMessageBubble;
