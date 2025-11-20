import { useState } from "react";
import axios from "axios"; 

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);

  const sendMessage = async () => {
    if (!msg.trim()) return;

    const userMsg = { sender: "user", text: msg };
    setHistory((prev) => [...prev, userMsg]);

    try {
      const res = await axios.post("https://datn-trung-duc-store.onrender.com/api/chatbot/ask", {
        message: msg,
        userId: localStorage.getItem("userId"),
      });

      const botMsg = { sender: "bot", text: res.data.answer };
      setHistory((prev) => [...prev, botMsg]);

    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Lỗi chatbot, thử lại sau!" }
      ]);
    }

    setMsg("");
  };

  return (
    <>
      {/* Nút mở */}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg"
        onClick={() => setOpen(!open)}
      >
        💬
      </button>

      {/* Popup chat */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-xl p-4 border">
          <div className="h-80 overflow-y-auto mb-2">
            {history.map((m, i) => (
              <div
                key={i}
                className={`p-2 my-1 rounded-lg ${
                  m.sender === "user"
                    ? "bg-blue-100 text-right"
                    : "bg-gray-100"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="flex-1 border p-2 rounded"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
