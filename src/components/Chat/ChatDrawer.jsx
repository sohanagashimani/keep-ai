import React, { useState, useEffect, useRef } from "react";
import { Drawer, Spin } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { toastConfig } from "@/config/toastConfig";
import When from "../When/When";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatInputArea from "./ChatInputArea";

const ChatDrawer = ({ visible, onClose, handleRefresh }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [fetching, setFetching] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(640);

  useEffect(() => {
    if (visible) {
      fetchMessages();
    }
  }, [visible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      setDrawerWidth(window.innerWidth < 640 ? window.innerWidth : 700);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchMessages = async () => {
    try {
      setFetching(true);
      const response = await axios.get("/api/chat");
      setMessages(response.data);
      setFetching(false);
    } catch (error) {
      toast.error("Failed to fetch messages", toastConfig);
      setFetching(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = input;
    setInput("");

    // Add user message to UI immediately
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (
          response.status === 429 ||
          (errorData?.error && errorData.error.toLowerCase().includes("limit"))
        ) {
          toast.error(
            "You have reached your daily AI chat limit.",
            toastConfig
          );
          setLoading(false);
          return;
        }
        throw new Error("Failed to send message");
      }

      const reader = response.body.getReader();
      let assistantMessage = "";

      let reading = true;
      while (reading) {
        const { done, value } = await reader.read();
        if (done) {
          reading = false;
          break;
        }

        const text = new TextDecoder().decode(value);
        assistantMessage += text;

        let parsed;
        try {
          parsed = JSON.parse(assistantMessage);
        } catch {
          parsed = { content: assistantMessage, action: null };
        }
        // Update the last message in real-time
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage?.role === "assistant") {
            lastMessage.content = parsed.content;
          } else {
            newMessages.push({ role: "assistant", content: parsed.content });
          }
          return newMessages;
        });

        // If the action is a note-modifying action, refresh notes
        if (
          [
            "create_note",
            "update_note",
            "delete_note",
            "complete_note",
            "uncomplete_note",
            "delete_all_notes",
            "restore_last_deleted_note",
            "restore_note_from_notes_table",
          ].includes(parsed.action)
        ) {
          handleRefresh();
        }
      }
    } catch (error) {
      toast.error("Failed to send message", toastConfig);
      // Remove the failed message
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

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
      width={drawerWidth}
    >
      <div className="flex flex-col h-full">
        <When isTrue={fetching}>
          <div className="flex h-full justify-center items-center">
            <Spin spinning={true} size="large" />
          </div>
        </When>
        <When isTrue={!fetching}>
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
