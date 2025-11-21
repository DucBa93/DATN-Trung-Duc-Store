import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageSquare, X } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://datn-trung-duc-store.onrender.com/api/chatbot/chat",
        { message: userMsg.content }
      );

      const botMsg = { role: "assistant", content: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Bot bị lỗi, thử lại sau nhé!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút mở chat */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <MessageSquare size={24} />
      </button>

      {/* Khung chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-lg border flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <span className="font-semibold">Chatbot hỗ trợ</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-blue-100 ml-auto"
                    : "bg-gray-100"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="bg-gray-200 p-2 rounded-lg w-fit text-gray-600">
                Bot đang trả lời...
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="border-t p-2 flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none"
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
