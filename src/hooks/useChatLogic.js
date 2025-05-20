import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { toastConfig } from "@/config/toastConfig";

const useChatLogic = handleRefresh => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fetchMessages = useCallback(async () => {
    try {
      setFetchingMessages(true);
      const response = await axios.get("/api/chat");
      setMessages(response.data);
    } catch (error) {
      toast.error("Failed to fetch messages", toastConfig);
    } finally {
      setFetchingMessages(false);
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = input.trim();
    setInput("");

    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

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
        setMessages(prev => {
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
          handleRefresh?.();
        }
      }
    } catch (error) {
      toast.error("Failed to send message", toastConfig);
      // Remove the failed message
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [input, handleRefresh]);

  return {
    messages,
    input,
    setInput,
    loading,
    messagesEndRef,
    handleSend,
    fetchMessages,
    fetchingMessages,
  };
};

export default useChatLogic;
