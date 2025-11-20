import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllShippers } from "@/store/shipper/shipper-slice";
import { User, Search } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function ShipperAccounts() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.shipper);

  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    dispatch(fetchAllShippers());
  }, [dispatch]);

  useEffect(() => {
    const keyword = search.toLowerCase();

    const result = list.filter((ship) => {
      const name = ship.userId?.userName?.toLowerCase() || "";
      const email = ship.userId?.email?.toLowerCase() || "";
      return name.includes(keyword) || email.includes(keyword);
    });

    setFiltered(result);
  }, [search, list]);

  return (
    <div className="p-6">
      <Card className="shadow-md rounded-2xl">
        <CardHeader className="flex justify-between items-center flex-row">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5" /> Danh sách Shipper
          </CardTitle>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-8 w-60"
              placeholder="Tìm tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Tên Shipper</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Số điện thoại</th>
                  <th className="px-4 py-2 text-left">Ngân hàng</th>
                  <th className="px-4 py-2 text-left">Số tài khoản</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ship) => (
                  <tr
                    key={ship._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">
                      {ship.userId?.userName || "(chưa có tên)"}
                    </td>
                    <td className="px-4 py-2">{ship.userId?.email}</td>
                    <td className="px-4 py-2">{ship.phone || "-"}</td>
                    <td className="px-4 py-2">{ship.bankName || "-"}</td>
                    <td className="px-4 py-2">{ship.bankNumber || "-"}</td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 italic text-gray-500">
                      Không có shipper nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ShipperAccounts;
