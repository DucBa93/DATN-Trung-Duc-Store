import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { updateUserDataRedux } from "@/store/auth-slice"; // action cập nhật Redux

function UserInfo() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [userName, setUserName] = useState(user?.userName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      // Khởi tạo user mới dựa trên Redux hiện tại
      let updatedUser = { ...user };

      // ✅ 1. Cập nhật thông tin cơ bản (tên + email)
      const baseRes = await axios.put(
        "http://localhost:5000/api/shop/user/update",
        {
          userId: user.id,
          userName,
          email,
        }
      );

      if (baseRes.data.user) {
        updatedUser = { ...updatedUser, ...baseRes.data.user };
      }

      // ✅ 2. Nếu có mật khẩu mới thì update riêng
      if (password.trim() !== "") {
        await axios.put("http://localhost:5000/api/shop/user/update-password", {
          userId: user.id,
          newPassword: password,
        });
      }

      // ✅ 3. Nếu có avatar mới thì upload file
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        formData.append("userId", user.id);

        const avatarRes = await axios.post(
          "http://localhost:5000/api/shop/user/upload-avatar",
          formData
        );

        console.log("✅ avatarRes.data:", avatarRes.data); // <--- Thêm dòng này
        if (avatarRes.data.success && avatarRes.data.user) {
          updatedUser = { ...updatedUser, ...avatarRes.data.user };
        }
      }


      // ✅ 4. Lưu lại Redux + localStorage
      dispatch(updateUserDataRedux(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Cập nhật thông tin thành công!");
      setPassword(""); // clear input
    } catch (err) {
      console.error("❌ Update user error:", err);
      toast.error("Lỗi khi cập nhật tài khoản");
    } finally {
      setLoading(false);
    }
  };


  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-bold">Thông tin tài khoản</h2>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <img
          src={avatarPreview || "/default-avatar.png"}
          className="w-24 h-24 rounded-full object-cover border"
          alt="Avatar"
        />
        <input type="file" accept="image/*" onChange={handleAvatarSelect} />
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3 w-80">
        <label>Họ và tên</label>
        <input
          className="border p-2 rounded"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />

        <label>Email</label>
        <input
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Mật khẩu </label>
        <input
          type="password"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu mới nếu muốn đổi"
        />

        <button
          disabled={loading}
          onClick={handleUpdate}
          className="bg-blue-600 text-white p-2 rounded mt-3 disabled:bg-gray-400"
        >
          {loading ? "Đang xử lý..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}

export default UserInfo;
