import React from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";

const ChatInputArea = ({ input, setInput, handleSend, loading }) => {
  const handleKeyPress = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 md:bg-neutral-800 bg-neutral-900 rounded-2xl md:rounded-b-2xl">
      <div className="flex space-x-2 items-end">
        <Input.TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={handleKeyPress}
          placeholder="Type your message..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          className="flex-1 bg-neutral-700 text-gray-200 border-none focus:shadow-none rounded-xl text-base placeholder-gray-400"
          style={{ resize: "none", padding: "10px" }}
        />
        <Button
          type="primary"
          icon={<SendOutlined style={{ color: "#fff", fontSize: 22 }} />}
          onClick={handleSend}
          loading={loading}
          className="bg-blue-600 border-none rounded-full flex justify-center items-center hover:bg-blue-700"
          style={{
            height: 44,
            width: 44,
            minWidth: 44,
            minHeight: 44,
            boxShadow: "none",
          }}
        />
      </div>
    </div>
  );
};

export default ChatInputArea;
