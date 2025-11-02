import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, PackageCheck } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function SalesStats() {
  const [stats, setStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchMonthlyRevenue();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/statistics/overview");
      setStats(res.data);
    } catch (err) {
      console.error("Lỗi khi tải thống kê:", err);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/statistics/revenue/monthly");
      console.log("Dữ liệu API doanh thu:", res.data);
      const formatted = Object.entries(res.data).map(([month, revenue]) => ({
        month,
        revenue,
      }));
      setMonthlyRevenue(formatted);
    } catch (err) {
      console.error("Lỗi khi tải doanh thu theo tháng:", err);
    }
  };

  if (!stats) return <p className="text-center mt-10 text-gray-500">Đang tải dữ liệu...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">📊 Thống kê bán hàng</h1>

      {/* Tổng quan */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp /> Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-green-700">
            {stats.totalRevenue.toLocaleString("vi-VN")} ₫
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <ShoppingCart /> Tổng đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-blue-700">
            {stats.totalOrders}
          </CardContent>
        </Card>

        <Card className="bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <PackageCheck /> Sản phẩm đã bán
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-yellow-700">
            {stats.totalProductsSold}
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ doanh thu */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Doanh thu theo tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => `${v.toLocaleString("vi-VN")} ₫`} />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sản phẩm bán chạy / ế */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>🏆 Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bestSellers.map((p, i) => (
              <div key={i} className="flex items-center gap-3 border-b py-2">
                <img src={p.image} alt={p.title} className="w-12 h-12 rounded object-cover" />
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-gray-500">
                    {p.quantity} sp - {p.totalRevenue.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📉 Sản phẩm bán chậm</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.worstSellers.map((p, i) => (
              <div key={i} className="flex items-center gap-3 border-b py-2">
                <img src={p.image} alt={p.title} className="w-12 h-12 rounded object-cover" />
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-gray-500">
                    {p.quantity} sp - {p.totalRevenue.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
