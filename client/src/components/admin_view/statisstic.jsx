import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { TrendingUp, ShoppingCart, PackageCheck } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function SalesStats() {
  const now = new Date();
  const currentDay = now.toLocaleDateString("vi-VN");
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal sản phẩm bán
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [soldProducts, setSoldProducts] = useState([]);
  const [showAllSold, setShowAllSold] = useState(false);

  // Thống kê vốn nhập
  const [importProducts, setImportProducts] = useState([]);
  const [showAllImport, setShowAllImport] = useState(false);

  // Bộ lọc
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [type, setType] = useState("monthly");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([fetchOverview(), fetchRevenue()]);
    setLoading(false);
  };

  const fetchOverview = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/statistics/overview"
      );
      setStats(res.data);
    } catch (err) {
      console.error("Lỗi khi tải tổng quan:", err);
    }
  };

  const fetchRevenue = async (from, to) => {
    try {
      let url = "";
      if (from && to) {
        url = `http://localhost:5000/api/admin/statistics/revenue?from=${from}&to=${to}`;
      } else if (type === "monthly") {
        url = `http://localhost:5000/api/admin/statistics/revenue/monthly?year=${year}`;
      } else if (type === "daily") {
        url = `http://localhost:5000/api/admin/statistics/revenue/daily?year=${year}&month=${month}`;
      } else if (type === "weekly") {
        url = `http://localhost:5000/api/admin/statistics/revenue/weekly?year=${year}`;
      }

      const res = await axios.get(url);
      const formatted = Object.entries(res.data).map(([key, value]) => ({
        label: key,
        revenue: value,
      }));
      setRevenueData(formatted);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu doanh thu:", err);
    }
  };

  const handleFilter = () => {
    if (!fromDate || !toDate) return alert("Vui lòng chọn từ ngày và đến ngày!");
    fetchRevenue(fromDate, toDate);
  };

  // Lấy sản phẩm bán (ngày/tháng)
  const fetchSoldProducts = async (typeFetch) => {
    try {
      let url = "";
      let title = "";

      if (typeFetch === "day") {
        const today = new Date().toISOString().slice(0, 10);
        url = `http://localhost:5000/api/admin/statistics/revenue/products?day=${today}`;
        title = `📦 Sản phẩm bán trong ngày ${currentDay}`;
      } else if (typeFetch === "month") {
        const y = currentYear;
        const m = String(currentMonth).padStart(2, "0");
        url = `http://localhost:5000/api/admin/statistics/revenue/products?month=${y}-${m}`;
        title = `📦 Sản phẩm bán trong tháng ${currentMonth}`;
      }

      const res = await axios.get(url);
      setSoldProducts(res.data);
      setModalTitle(title);
      setShowAllSold(false);
      setOpenModal(true);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải sản phẩm bán");
    }
  };

  // Lấy vốn nhập
  const fetchImportCostMonth = async () => {
    try {
      const y = year;
      const m = String(month).padStart(2, "0");
      const res = await axios.get(
        `http://localhost:5000/api/admin/statistics/import-cost?month=${y}-${m}`
      );
      setImportProducts(res.data);
      setShowAllImport(false);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lấy dữ liệu vốn nhập");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Đang tải dữ liệu...</p>;

  // Helpers: Top 10 sản phẩm
  const topSoldProducts = showAllSold ? soldProducts : soldProducts.slice(0, 10);
  const topImportProducts = showAllImport
    ? importProducts
    : importProducts.slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">📊 Thống kê bán hàng</h1>

      {/* Bộ lọc */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <label>Loại thống kê:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="daily">Theo ngày</option>
              <option value="weekly">Theo tuần</option>
              <option value="monthly">Theo tháng</option>
            </select>
          </div>

          {type === "daily" && (
            <>
              <div className="flex items-center gap-2">
                <label>Năm:</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="border rounded px-2 py-1 w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <label>Tháng:</label>
                <input
                  type="number"
                  value={month}
                  min={1}
                  max={12}
                  onChange={(e) => setMonth(e.target.value)}
                  className="border rounded px-2 py-1 w-20"
                />
              </div>
            </>
          )}

          {type === "weekly" && (
            <div className="flex items-center gap-2">
              <label>Năm:</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="border rounded px-2 py-1 w-20"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <label>Từ ngày:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <label>Đến ngày:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>

          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Lọc
          </button>
        </div>
      </Card>

      {/* Tổng quan */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card
          className="bg-green-50 cursor-pointer"
          onClick={() => fetchSoldProducts("month")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp /> Tổng doanh thu (Tháng {currentMonth})
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-green-700">
            {stats.totalRevenueMonth?.toLocaleString("vi-VN")} ₫
          </CardContent>
        </Card>

        <Card
          className="bg-green-100 cursor-pointer"
          onClick={() => fetchSoldProducts("day")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp /> Tổng doanh thu ({currentDay})
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-green-800">
            {stats.totalRevenueDay?.toLocaleString("vi-VN")} ₫
          </CardContent>
        </Card>

        <Card className="bg-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <TrendingUp /> Tổng doanh thu ({currentYear})
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-green-900">
            {stats.totalRevenue.toLocaleString("vi-VN")} ₫
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ doanh thu */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={revenueData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip
                 formatter={(value) => `${value.toLocaleString("vi-VN")} ₫`}
              />
              <Bar dataKey="revenue" fill="#16a34a"  />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Thống kê vốn nhập */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>💰 Thống kê vốn nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={fetchImportCostMonth}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Lấy dữ liệu vốn nhập tháng {month}/{year}
          </button>
          {importProducts.length > 0 && (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <p className="text-gray-700 font-medium">Tổng vốn nhập tháng {currentMonth}/{currentYear}</p>

      {/* Tính tổng vốn nhập từ danh sách sản phẩm */}
      <p className="text-2xl font-bold text-blue-700 mt-1">
        {importProducts
          .reduce((sum, product) => {
            const totalStock =
              product.variants?.reduce((sV, variant) => {
                return (
                  sV +
                  variant.sizes?.reduce((sS, size) => sS + (size.stock || 0), 0)
                );
              }, 0) || 0;

            return sum + (product.importPrice || 0) * totalStock;
          }, 0)
          .toLocaleString("vi-VN")}{" "}
        ₫
      </p>
    </div>
  )}

          {topImportProducts.length === 0 ? (
            <p className="text-gray-500">Không có sản phẩm để thống kê</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topImportProducts.map((product) => {
                const totalStock =
                  product.variants?.reduce((sumV, variant) => {
                    return (
                      sumV +
                      variant.sizes?.reduce((sumS, size) => sumS + (size.stock || 0), 0)
                    );
                  }, 0) || 0;

                const totalImportCost = (product.importPrice || 0) * totalStock;

                return (
                  <div
                    key={product._id}
                    className="p-4 rounded-xl shadow bg-white flex flex-col gap-2"
                  >
                    <p className="text-gray-600 text-sm">Tên sản phẩm</p>
                    <p className="text-lg font-semibold">{product.title}</p>

                    <p className="text-gray-600 text-sm">Tổng số sản phẩm</p>
                    <p className="text-lg font-semibold">{totalStock}</p>

                    <p className="text-gray-600 text-sm">Tổng vốn nhập</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {totalImportCost.toLocaleString("vi-VN")} ₫
                    </p>

                    <p className="text-gray-600 text-sm">Giá nhập trung bình / sp</p>
                    <p className="text-lg font-semibold text-green-600">
                      {totalStock > 0
                        ? Math.round(totalImportCost / totalStock).toLocaleString("vi-VN")
                        : 0}{" "}
                      ₫
                    </p>
                  </div>
                );
              })}
            </div>
          )}
          {importProducts.length > 10 && (
            <button
              onClick={() => setShowAllImport(!showAllImport)}
              className="mt-2 px-4 py-2 bg-gray-200 rounded w-full"
            >
              {showAllImport ? "Thu gọn" : `Xem tất cả (${importProducts.length})`}
            </button>
          )}
        </CardContent>
      </Card>

      {/* Bestseller / WorstSeller */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Sản phẩm bán chạy */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bestSellers.length === 0 ? (
              <p className="text-gray-500">Chưa có sản phẩm bán chạy</p>
            ) : (
              stats.bestSellers.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3 border-b py-2">
                  <img src={p.image} className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-gray-500">
                      {p.quantity} sp – {p.totalRevenue.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sản phẩm bán chậm */}
        <Card>
          <CardHeader>
            <CardTitle>📉 Sản phẩm bán chậm</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.worstSellers.length === 0 ? (
              <p className="text-gray-500">Chưa có sản phẩm bán chậm</p>
            ) : (
              stats.worstSellers.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3 border-b py-2">
                  <img src={p.image} className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-gray-500">
                      {p.quantity} sp – {p.totalRevenue.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODAL sản phẩm bán */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-10 z-50">
          <div className="bg-white p-4 rounded w-[90%] md:w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-3">{modalTitle}</h2>

            {topSoldProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Không có sản phẩm nào</p>
            ) : (
              topSoldProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3 border-b py-2">
                  <img src={p.image} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-sm text-gray-600">
                      {p.quantity} sản phẩm — {p.revenue.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </div>
              ))
            )}
            {soldProducts.length > 10 && (
              <button
                onClick={() => setShowAllSold(!showAllSold)}
                className="mt-2 px-4 py-2 bg-gray-200 rounded w-full"
              >
                {showAllSold ? "Thu gọn" : `Xem tất cả (${soldProducts.length})`}
              </button>
            )}

            <button
              onClick={() => setOpenModal(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
