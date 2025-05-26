import React, { useEffect } from "react";
import { Spin } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatInputArea from "./ChatInputArea";
import useChatLogic from "@/hooks/useChatLogic";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import When from "../When/When";

const ChatDrawer = ({ visible, onClose, handleRefresh, asFlex }) => {
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const {
    messages,
    input,
    setInput,
    loading,
    messagesEndRef,
    handleSend,
    fetchMessages,
    fetchingMessages,
  } = useChatLogic(handleRefresh);

  useEffect(() => {
    if (isMobile && visible) {
      onClose();
      router.push("/chat");
    }
  }, [isMobile, visible, onClose, router]);

  useEffect(() => {
    if (visible) {
      fetchMessages();
    }
  }, [visible, fetchMessages]);

  // Drawer style for flex mode
  const drawerClass = asFlex
    ? "h-full w-full   transition-all duration-300 ease-in-out"
    : `fixed right-0 top-0 h-full w-[700px]   transition-transform duration-300 ease-in-out ${
        visible ? "translate-x-0" : "translate-x-full"
      }`;

  return (
    <div className={drawerClass} style={{ zIndex: asFlex ? undefined : 30 }}>
      <div className="w-full h-full flex flex-col p-0">
        <div className="rounded-2xl shadow-lg bg-neutral-800 h-[calc(100%)] flex flex-col">
          {/* Header (sticky, consistent bg) */}
          <div className="flex items-center justify-between w-full px-6 py-6 bg-neutral-800 border-b border-neutral-500  rounded-t-2xl sticky top-0 z-10">
            <span className="font-bold text-lg text-[#e5e5e5]">
              AI Assistant
            </span>
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-[#232323] rounded-full p-1 ml-2 transition-colors"
            >
              <CloseOutlined style={{ fontSize: 20, color: "#e5e5e5" }} />
            </button>
          </div>

          {/* Messages and Input */}
          <div className="flex flex-col flex-1 min-h-0">
            <When isTrue={fetchingMessages}>
              <div className="flex h-full justify-center items-center">
                <Spin spinning={true} size="large" />
              </div>
            </When>
            <When isTrue={!fetchingMessages}>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-neutral-800 hide-scrollbar">
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
              <div className="sticky bottom-0 z-10 bg-neutral-800 border-t border-[#333] rounded-b-2xl">
                <ChatInputArea
                  input={input}
                  setInput={setInput}
                  handleSend={handleSend}
                  loading={loading}
                />
              </div>
            </When>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;
