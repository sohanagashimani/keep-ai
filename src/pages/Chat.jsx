import React, { useEffect } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import ChatMessageBubble from "../components/Chat/ChatMessageBubble";
import ChatInputArea from "../components/Chat/ChatInputArea";
import useChatLogic from "../hooks/useChatLogic";
import { Spin } from "antd";
import When from "../components/When/When";

const Chat = ({ handleRefresh }) => {
  const router = useRouter();
  const {
    messages,
    input,
    setInput,
    loading,
    messagesEndRef,
    handleSend,
    fetchingMessages,
    fetchMessages,
  } = useChatLogic(handleRefresh);
  useEffect(() => {
    fetchMessages();
  }, []);
  return (
    <div className="relative h-screen bg-[#1a1a1a]">
      {/* Header - Fixed at top */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-[#181818] border-b border-[#333]">
        <button
          onClick={() => router.back()}
          className="text-[#e5e5e5] hover:text-white"
        >
          <ArrowLeftOutlined style={{ fontSize: 20 }} />
        </button>
        <span className="font-bold text-lg text-[#e5e5e5]">AI Assistant</span>
        <div className="w-6" /> {/* Spacer for alignment */}
      </div>

      {/* Messages Area - Scrollable */}
      <When isTrue={fetchingMessages}>
        <div className="h-full flex justify-center items-center">
          <Spin spinning={true} size="large" />
        </div>
      </When>
      <When isTrue={!fetchingMessages}>
        <div className="h-[calc(100vh-8rem)] mt-16 mb-20 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <ChatMessageBubble message={message} />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#333] bg-[#1a1a1a]">
          <ChatInputArea
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            loading={loading}
          />
        </div>
      </When>
    </div>
  );
};

export default Chat;
