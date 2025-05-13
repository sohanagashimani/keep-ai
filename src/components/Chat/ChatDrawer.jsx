import React, { useState, useEffect, useRef } from "react";
import { Drawer, Input, Button, Spin } from "antd";
import { SendOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { toastConfig } from "@/config/toastConfig";
import When from "../When/When";

const ChatDrawer = ({ visible, onClose, handleRefresh }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [fetching, setFetching] = useState(false);
  useEffect(() => {
    if (visible) {
      fetchMessages();
    }
  }, [visible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
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
          <span className="font-bold text-lg text-gray-100">AI Assistant</span>
          <Button
            type="text"
            icon={<CloseOutlined style={{ fontSize: 20, color: "#fff" }} />}
            onClick={onClose}
            className="hover:bg-gray-700"
            style={{ marginRight: -12 }}
          />
        </div>
      }
      onClose={onClose}
      closeIcon={null}
      open={visible}
      size="large"
      bodyStyle={{
        padding: 0,
        background: "#181818",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      headerStyle={{
        background: "#1a1a1a",
        borderBottom: "1px solid #333",
        padding: "16px 24px",
      }}
    >
      <div className="flex flex-col h-full">
        <When isTrue={fetching}>
          <div className="flex h-full justify-center items-center">
            <Spin spinning={true} size="large" />
          </div>
        </When>
        <When isTrue={!fetching}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-3 shadow transition-all ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-[#23272f] text-gray-200 border border-gray-700"
                  }`}
                  style={{
                    wordBreak: "break-word",
                    border:
                      message.role === "user"
                        ? "1px solid #2563eb"
                        : "1px solid #333",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-700 bg-[#1a1a1a]">
            <div className="flex space-x-2 items-end">
              <Input.TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={handleSend}
                placeholder="Type your message..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                className="flex-1 bg-[#23272f] text-gray-200 border-none focus:shadow-none rounded-lg"
                style={{
                  resize: "none",
                  padding: "10px",
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={loading}
                className="bg-blue-600 border-none"
                style={{ height: 40, width: 40, borderRadius: "50%" }}
              />
            </div>
          </div>
        </When>
      </div>
    </Drawer>
  );
};

export default ChatDrawer;
