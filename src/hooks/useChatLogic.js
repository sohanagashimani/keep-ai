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
          toast.error("You have reached your daily AI chat limit.", {
            ...toastConfig,
            autoClose: 2600,
          });
          setLoading(false);
          setMessages(prev => prev.slice(0, -1));
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
          // Clean the message by removing markdown code blocks and extra whitespace
          const cleanMessage = assistantMessage
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

          // Try to parse as array first
          const arrayMatch = cleanMessage.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            parsed = {
              content: cleanMessage,
              action: JSON.parse(arrayMatch[0]),
            };
          } else {
            // Try to parse as single object
            const objectMatch = cleanMessage.match(/{[\s\S]*}/);
            if (objectMatch) {
              parsed = {
                content: cleanMessage,
                action: JSON.parse(objectMatch[0]),
              };
            } else {
              parsed = { content: cleanMessage, action: null };
            }
          }

          // Format the message content before updating state
          let displayContent = parsed.content;
          try {
            // If parsed.content is a JSON string, try to parse and extract .content
            const maybeObj =
              typeof displayContent === "string"
                ? JSON.parse(displayContent)
                : displayContent;
            if (maybeObj && maybeObj.content) {
              displayContent = maybeObj.content;
            }
          } catch (e) {
            // Not JSON, just use as is
          }

          // Clean up and format the content
          const formattedContent = displayContent
            .split("\n\n")
            .map(section => section.trim())
            .filter(section => section.length > 0)
            .join("\n\n");

          // Update the last message in real-time
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.role === "assistant") {
              lastMessage.content = formattedContent;
            } else {
              newMessages.push({
                role: "assistant",
                content: formattedContent,
              });
            }
            return newMessages;
          });

          // If the action is a note-modifying action, refresh notes
          if (parsed.action) {
            const actions = Array.isArray(parsed.action)
              ? parsed.action
              : [parsed.action];

            // Check if any action modifies notes
            const shouldRefresh = actions.some(action => {
              // Handle both string actions and object actions
              const actionType =
                typeof action === "string" ? action : action.action;
              return [
                "create_note",
                "update_note",
                "delete_note",
                "complete_note",
                "uncomplete_note",
                "delete_all_notes",
                "restore_last_deleted_note",
                "restore_note_from_notes_table",
              ].includes(actionType);
            });

            if (shouldRefresh) {
              handleRefresh?.();
            }
          }
        } catch (e) {
          parsed = { content: assistantMessage, action: null };
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
