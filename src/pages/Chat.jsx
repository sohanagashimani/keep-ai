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
    <div className="flex flex-col h-[100vh] bg-[#1a1a1a]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#181818] border-b border-[#333]">
        <button
          onClick={() => router.back()}
          className="text-[#e5e5e5] hover:text-white p-2 -ml-2"
        >
          <ArrowLeftOutlined style={{ fontSize: 20 }} />
        </button>
        <span className="font-bold text-lg text-[#e5e5e5]">AI Assistant</span>
        <div className="w-6" /> {/* Spacer for alignment */}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <When isTrue={fetchingMessages}>
          <div className="h-full flex justify-center items-center">
            <Spin spinning={true} size="large" />
          </div>
        </When>
        <When isTrue={!fetchingMessages}>
          {/* Messages Container */}
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-4">
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
          </div>

          {/* Input Area */}
          <div className="border-t border-[#333] bg-[#1a1a1a] p-4">
            <ChatInputArea
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              loading={loading}
            />
          </div>
        </When>
      </main>
    </div>
  );
};

export default Chat;
