import { AlignJustify, LogOut, Bell } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import axios from "axios";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useTranslation } from "react-i18next";


function AdminHeader({ setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const socketRef = useRef(null);

  // --- Socket.IO realtime ---
  useEffect(() => {
  const socket = io("http://localhost:5000");
  socketRef.current = socket;

  socket.on("connect", () => {
    console.log("✅ Admin socket connected");
    socket.emit("register-admin");
  });

  socket.on("notification", (data) => {
    toast.success(data.message);
    setNotifications((prev) => [data, ...prev]);
  });

  return () => socket.disconnect();
}, []);



  // --- Fetch notifications from backend (history) ---
 useEffect(() => {
  axios
    .get("http://localhost:5000/api/shop/user/notifications/admin")
    .then((res) => setNotifications(res.data))
    .catch((err) => console.error(err));
}, []);



  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function handleLogout() {
    dispatch(logoutUser()).then(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("adminNotifications"); // ✅ clear notifs
      window.location.href = "/";
    });
  }


  const markAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/shop/user/notifications/mark-as-read/${id}`
      );
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        localStorage.setItem("adminNotifications", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleToggleNotif = async () => {
  setShowNotif(!showNotif);

  // 🔹 Nếu đang mở (nghĩa là người dùng vừa bấm để xem)
  if (!showNotif && notifications.some((n) => !n.isRead)) {
    try {
      await axios.put(
        `http://localhost:5000/api/shop/user/notifications/mark-all-as-read/admin`
      );
      // Cập nhật lại local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error(err);
    }
  }
};


  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
      {/* Toggle menu */}
      <Button onClick={() => setOpen(true)} className="lg:hidden sm:block">
        <AlignJustify />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="flex items-center gap-4 ml-auto relative">
        {/* Notification */}
        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={handleToggleNotif}
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
              {unreadCount}
            </span>
          )}
        </Button>
        {showNotif && (
          <div className="absolute right-0 top-10 w-80 max-h-96 overflow-y-auto bg-white border shadow-md rounded-md p-2 z-50">
            <h4 className="font-semibold mb-2">Thông báo mới</h4>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">Không có thông báo</p>
            ) : (
              <ul className="space-y-1">
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    onClick={() => markAsRead(n._id)}
                    className={`p-2 rounded cursor-pointer ${n.isRead ? "bg-gray-100" : "bg-white"
                      } hover:bg-gray-50`}
                  >
                    {n.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {/* Logout */}
        <Button
          onClick={handleLogout}
          className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow"
        >
          <LogOut />
          {t("Đăng xuất")}
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
