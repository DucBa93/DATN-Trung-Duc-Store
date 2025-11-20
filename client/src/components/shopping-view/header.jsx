import { Bell, HousePlug, LogOut, Menu, ShoppingCart, UserCog } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState, useRef } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { toast } from "sonner";
import axios from "axios";
import { io } from "socket.io-client";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useTranslation } from "react-i18next";

function MenuItems() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleNavigate = (menuItem) => {
    sessionStorage.removeItem("filters");
    const currentFilter =
      menuItem.id !== "home" && menuItem.id !== "products" && menuItem.id !== "search"
        ? { category: [menuItem.id] }
        : null;

    if (currentFilter) sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(new URLSearchParams(`?category=${menuItem.id}`))
      : navigate(menuItem.path);
  };

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          key={menuItem.id}
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer"
        >
          {t(`${menuItem.label}`)}
        </Label>
      ))}
    </nav>
  );
}


function HeaderRightContent() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [openNotifSheet, setOpenNotifSheet] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef(null);

  // --- Load cart ---
  useEffect(() => {
    if (user?.id) dispatch(fetchCartItems(user.id));
  }, [dispatch, user?.id]);

  // --- Load notifications cache from localStorage ---
  useEffect(() => {
    if (!user?.id) return;
    const saved = localStorage.getItem(`notifications_${user.id}`);
    if (saved) setNotifications(JSON.parse(saved));
  }, [user?.id]);

  // --- Fetch notifications from backend and setup socket ---
  // --- Fetch notifications from backend and setup socket ---
useEffect(() => {
  if (!user?.id) return;

  // ✅ Load cache trước
  const cached = localStorage.getItem(`notifications_${user.id}`);
  if (cached) setNotifications(JSON.parse(cached));

  // ✅ Fetch backend
  axios.get(`http://localhost:5000/api/shop/user/notifications/${user.id}`)
    .then(res => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Chỉ overwrite nếu backend có dữ liệu
        setNotifications(res.data);
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(res.data));
      }
    })
    .catch(err => console.error(err));

  // ✅ Setup socket
  const socket = io("http://localhost:5000");
  socketRef.current = socket;

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    socket.emit("register", user.id);
  });

  socket.on("notification", (data) => {
    toast.success(data.message);
    setNotifications(prev => {
      const updated = [data, ...prev];
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  });

  return () => socket.disconnect();
}, [user?.id]);


  // --- Update unread count ---
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  // --- Mark single notification as read ---
  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/shop/user/notifications/mark-as-read/${id}`);
      setNotifications(prev => {
        const updated = prev.map(n => n._id === id ? { ...n, isRead: true } : n);
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };

  // --- Mark all as read when opening notification sheet ---
  const handleToggleNotif = async (open) => {
    setOpenNotifSheet(open);
    if (open && notifications.some(n => !n.isRead)) {
      try {
        await axios.put(`http://localhost:5000/api/shop/user/notifications/mark-as-read/${user.id}`);
        const updated = notifications.map(n => ({ ...n, isRead: true }));
        setNotifications(updated);
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
  };
  
  // --- Logout ---
  const handleLogout = () => {
    dispatch(logoutUser());
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    navigate("/shop/home");
    // ✅ Không reset notifications, giữ cache ở localStorage
  };

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <LanguageSwitcher />
      {/* 🔔 Notifications */}
      <Sheet open={openNotifSheet} onOpenChange={handleToggleNotif}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-100 ">
          <h2 className="text-lg font-semibold mb-2">{t("Thông báo")}</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">{t("Không có thông báo")}</p>
          ) : (
            <ul className="space-y-2 max-h-[500px] overflow-y-auto">
              {notifications.map(n => (
                <li
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`p-2 border rounded cursor-pointer ${n.isRead ? "bg-gray-100" : "bg-white"} hover:bg-gray-50`}
                >
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </SheetContent>
      </Sheet>

      {/* 🛒 Cart */}
      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <Button variant="outline" size="icon" onClick={() => setOpenCartSheet(true)} className="relative">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute top-[-5px] right-[2px] font-bold text-sm">
            {cartItems?.items?.length || 0}
          </span>
        </Button>
        <UserCartWrapper setOpenCartSheet={setOpenCartSheet} cartItems={cartItems?.items?.length > 0 ? cartItems.items : []} />
      </Sheet>
          
      {/* 👤 User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <img src={user?.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56">
          <DropdownMenuLabel> {user?.userName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/shop/account")}>
            <UserCog className="mr-2 h-4 w-4" />
            {t("Tài khoản")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("Đăng xuất")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/shop/home" className="flex items-center gap-2">
          <HousePlug className="h-6 w-6" />
          <span className="font-bold">Trung Duc</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems />
            <HeaderRightContent />
          </SheetContent>
        </Sheet>
        <div className="hidden lg:block">
          <MenuItems />
        </div>
        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
