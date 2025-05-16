import React, { useEffect } from "react";
import { Drawer, Spin } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatInputArea from "./ChatInputArea";
import useChatLogic from "@/hooks/useChatLogic";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import When from "../When/When";

const ChatDrawer = ({ visible, onClose, handleRefresh }) => {
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

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between w-full">
          <span className="font-bold text-lg text-[#e5e5e5]">AI Assistant</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-[#232323] rounded-full p-1 ml-2"
          >
            <CloseOutlined style={{ fontSize: 20, color: "#e5e5e5" }} />
          </button>
        </div>
      }
      onClose={onClose}
      closeIcon={null}
      open={visible}
      size="large"
      bodyStyle={{
        padding: 0,
        background: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      headerStyle={{
        background: "#181818",
        borderBottom: "1px solid #333",
        padding: "16px 24px",
      }}
      width={700}
    >
      <div className="flex flex-col h-full">
        <When isTrue={fetchingMessages}>
          <div className="flex h-full justify-center items-center">
            <Spin spinning={true} size="large" />
          </div>
        </When>
        <When isTrue={!fetchingMessages}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#1a1a1a]">
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
          <ChatInputArea
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            loading={loading}
          />
        </When>
      </div>
    </Drawer>
  );
};

export default ChatDrawer;
