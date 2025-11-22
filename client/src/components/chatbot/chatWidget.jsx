import { useState, useEffect, useRef } from "react";
import data from "../../chatbot/data.json";

export default function ChatWidget() {
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" }
  ]);

  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);

  // ============================
  // 🟦 LOAD SẢN PHẨM TỪ SERVER
  // ============================
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/shop/products/all");
        const data = await res.json();

        setProducts(data.data);
        console.log("Loaded products:", data.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    loadProducts();
  }, []);
  
  // ============================
  // 🟦 AUTO SCROLL TO BOTTOM
  // ============================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Bỏ dấu tiếng Việt
  function removeVietnamese(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  }

  // ============================
  // 🟦 NLP TỪ FILE data.json
  // ============================
  function nlpResponse(text) {
  const clean = removeVietnamese(text);

  for (const intent of data.intents) {
    for (const pattern of intent.patterns) {
      const p = removeVietnamese(pattern);

      // Khớp 80%
      if (clean.includes(p)) {
        const replies = intent.responses;
        return replies[Math.floor(Math.random() * replies.length)];
      }
    }
  }

  return null; // Không match → để AI xử lý tiếp
}

//tu van san pham
function isConsulting(text) {
  const msg = removeVietnamese(text);

  return (
    msg.includes("tu van") ||
    msg.includes("goi y") ||
    msg.includes("nen mua") ||
    msg.includes("chon giup") ||
    msg.includes("tu van giup") ||
    msg.includes("goi y cho toi")
  );
}

const getBestSellerByBrand = (brandName, limit = 5) => {
  if (!products.length)
    return "⏳ Đang tải danh sách sản phẩm, vui lòng chờ...";

  const brand = removeVietnamese(brandName);

  // 1. Lọc sản phẩm theo brand
  let filtered = products.filter(
    (p) => removeVietnamese(p.brand || "").includes(brand)
  );

  if (!filtered.length)
    return `❌ Không tìm thấy sản phẩm thuộc thương hiệu "${brandName}".`;

  // 2. Sắp xếp theo số lượng đã bán (sold)
  filtered.sort((a, b) => (b.sold || 0) - (a.sold || 0));

  // 3. Lấy top 3–5 sản phẩm
  let top = filtered.slice(0, limit);

  // 4. Format trả về dạng danh sách
  let reply = `🔥 **Top ${top.length} sản phẩm bán chạy nhất của ${brandName.toUpperCase()}**:\n\n`;

  top.forEach((p, i) => {
    reply +=
      `⭐ **#${i + 1}: ${p.title}**\n` +
      `💰 Giá: ${p.price?.toLocaleString()} VNĐ\n` +
      `🔥 Sale: ${p.salePrice?.toLocaleString()}\n` +
      `📦 Số lượng còn: ${p.totalStock}\n` +
      `📊 Đã bán: ${p.sold}\n\n`;
  });

  return reply;
};




  // ============================
// tìm kiếm sản phẩm
// ============================
const searchProduct = (text) => {
  if (!products.length)
    return "⏳ Đang tải danh sách sản phẩm, vui lòng chờ...";

  const clean = removeVietnamese(text);

  // Nếu có từ tư vấn → gợi ý top
  if (isConsulting(text)) {
    return getTopProducts(text);
  }

  // Câu dạng "giay nike" → hỏi lại
  // Người dùng chỉ nói: "giày nike"
if (clean.startsWith("giay ")) {
  const brand = clean.replace("giay", "").trim();

  // Lưu lại brand để nếu user trả lời OK → tự tư vấn
  lastBotQuestionRef.current = brand;

  return (
    `👟 Bạn muốn tìm giày **${brand.toUpperCase()}** loại nào ạ?\n` +
    `Nếu muốn tôi có thể gợi ý **top mẫu bán chạy nhất ${brand.toUpperCase()}**`
  );
}


  const keywords = clean.split(" ");
  let matched = [];

  products.forEach((p) => {
    const name = removeVietnamese(p.title || "");
    const desc = removeVietnamese(p.description || "");
    const brand = removeVietnamese(p.brand || "");
    const category = removeVietnamese(p.category || "");

    let score = 0;

    if (name.includes(clean)) score += 3;
    if (brand.includes(clean)) score += 3;
    if (category.includes(clean)) score += 3;

    keywords.forEach((w) => {
      if (name.includes(w)) score += 2;
      if (desc.includes(w)) score += 1;
      if (brand.includes(w)) score += 2;
      if (category.includes(w)) score += 2;
    });

    if (score > 0) matched.push({ product: p, score });
  });

  if (!matched.length)
    return "❌ Không tìm thấy sản phẩm phù hợp. Bạn có thể thử tên khác nhé!";

  matched.sort((a, b) => b.score - a.score);

  const best = matched[0].product;

  return (
    `🟢 **${best.title}**\n` +
    `💵 Giá: ${best.price?.toLocaleString()} VNĐ\n` +
    `🔥 Giá sale: ${best.salePrice || "0"}\n` +
    `📦 Tồn kho: ${best.totalStock || "0"}\n` +
    `🏷 Thương hiệu: ${best.brand}\n` +
    `📂 Danh mục: ${best.category}`
  );
};



  // ============================
  // 🟦 GỬI TIN NHẮN
  // ============================
  const sendMessage = () => {
  if (!input.trim()) return;

  const userText = input.trim();
  setMessages((prev) => [...prev, { sender: "user", text: userText }]);
  setInput("");

  // 1. Kiểm tra NLP trước
  const nlp = nlpResponse(userText);
  if (nlp) {
    return setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: nlp }]);
    }, 300);
  }
  // ====== Xử lý yêu cầu top bán chạy theo brand ======
const clean = removeVietnamese(userText);

// Các brand có trong shop
const brands = ["nike", "adidas", "puma", "mlb", "new balance", "newbalance", "new_balance"];

// 1. Người dùng hỏi trực tiếp: "5 sp bán chạy nhất của nike"
for (let b of brands) {
  if (clean.includes("ban chay") && clean.includes(b.replace(" ", ""))) {
    const reply = getBestSellerByBrand(b, 5);
    return setTimeout(() => {
      setMessages(prev => [...prev, { sender: "bot", text: reply }]);
    }, 300);
  }
}

// 2. Người dùng trả lời "ok / ừ / được" sau khi bot hỏi
if (
  lastBotQuestionRef.current &&
  ["ok","oke","dc","được","duoc","uh","ừ","u","tư vấn","goi y"].some(t => clean.includes(t))
) {
  const brandAsked = lastBotQuestionRef.current; // brand bot đang hỏi
  lastBotQuestionRef.current = null; // reset

  const reply = getBestSellerByBrand(brandAsked, 5);
  return setTimeout(() => {
    setMessages(prev => [...prev, { sender: "bot", text: reply }]);
  }, 300);
}


  // 2. Tư vấn / tìm sản phẩm
  const reply = searchProduct(userText);

  setTimeout(() => {
    setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
  }, 300);
};

const lastBotQuestionRef = useRef(null);

  return (
    <>
      {/* Nút mở chat */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 w-80 bg-white rounded-2xl shadow-xl border flex flex-col">

          {/* Header có nút Clear */}
          <div className="bg-blue-600 text-white p-3 font-bold rounded-t-2xl flex justify-between items-center">
            <span>Chatbot AI (Store)</span>
            <button
              onClick={() =>
                setMessages([
                  { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" }
                ])
              }
              className="text-sm bg-red-500 px-2 py-1 rounded-lg hover:bg-red-600"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 p-3 overflow-y-auto space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl max-w-[80%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-200 text-black"
                }`}
              >
                <pre className="whitespace-pre-wrap text-sm">{msg.text}</pre>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              className="flex-1 border rounded-xl p-2 outline-none"
              placeholder="Nhập tên sản phẩm..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 rounded-xl"
            >
              Gửi
            </button>
          </div>

        </div>
      )}
    </>
  );
}
