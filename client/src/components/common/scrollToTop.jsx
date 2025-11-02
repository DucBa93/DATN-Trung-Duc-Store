import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Mỗi khi pathname thay đổi => scroll về đầu
    window.scrollTo({
      top: 0,
      behavior: "smooth", // hoặc "auto" nếu không muốn animation
    });
  }, [pathname]);

  return null;
}
