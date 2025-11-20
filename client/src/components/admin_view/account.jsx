import { useState, useEffect } from "react";
import axios from "axios";
import { User, Edit, Trash, Plus, Search } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function AdminAccounts() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    role: "user",
  });

  // 🆕 State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // số user mỗi trang

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users");
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách tài khoản!");
    }
  };

  useEffect(() => {
    const result = users.filter((u) => {
      const name = u.userName ? u.userName.toLowerCase() : "";
      const email = u.email ? u.email.toLowerCase() : "";
      const keyword = search.toLowerCase();
      return name.includes(keyword) || email.includes(keyword);
    });
    setFiltered(result);
    setCurrentPage(1); // reset về trang đầu khi tìm kiếm
  }, [search, users]);

  const openDialog = (user = null) => {
    setEditingUser(user);
    setFormData({
      userName: user?.userName || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "user",
    });
    setIsOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;

        await axios.put(
          `http://localhost:5000/api/admin/users/${editingUser._id}`,
          updateData
        );
        toast.success("Cập nhật tài khoản thành công!");
      } else {
        await axios.post("http://localhost:5000/api/admin/users", formData);
        toast.success("Thêm tài khoản thành công!");
      }
      fetchUsers();
      setIsOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu tài khoản!");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc muốn xóa tài khoản này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
        toast.success("Xóa thành công!");
        fetchUsers();
      } catch {
        toast.error("Không thể xóa tài khoản!");
      }
    }
  };

  // 🧮 Phân trang client-side
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <Card className="shadow-md rounded-2xl">
        <CardHeader className="flex justify-between items-center flex-row">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5" /> Quản lý tài khoản
          </CardTitle>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                className="pl-8 w-60"
                placeholder="Tìm kiếm tên hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              onClick={() => openDialog()}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Thêm tài khoản
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Tên người dùng</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Vai trò</th>
                  <th className="px-4 py-2 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">
                      {user.userName || "(Chưa có tên)"}
                    </td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 capitalize">{user.role}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(user._id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {currentUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center text-gray-500 py-4 italic"
                    >
                      Không có tài khoản nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 🧭 Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                ← Trước
              </Button>

              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Sau →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog thêm/sửa */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Sửa tài khoản" : "Thêm tài khoản mới"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Chỉnh sửa thông tin tài khoản người dùng. Để trống mật khẩu nếu không muốn đổi."
                : "Nhập thông tin để tạo tài khoản mới."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Tên người dùng</Label>
              <Input
                value={formData.userName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, userName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>
                Mật khẩu {editingUser ? "(để trống nếu không đổi)" : ""}
              </Label>
              <Input
                type="password"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  editingUser
                    ? "Nhập mật khẩu mới nếu muốn đổi"
                    : "Nhập mật khẩu"
                }
                required={!editingUser}
              />
            </div>

            <div>
              <Label>Vai trò</Label>
              <Input
                value={formData.role || "user"}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                {editingUser ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminAccounts;
