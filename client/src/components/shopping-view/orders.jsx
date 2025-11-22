import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "../ui/dialog";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
  cancelOrder
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog huỷ đơn hàng
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const itemsPerPage = 9;

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(id) {
    dispatch(getOrderDetails(id));
  }

  useEffect(() => {
    dispatch(getAllOrdersByUserId(user?.id));
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails) setOpenDetailsDialog(true);
  }, [orderDetails]);

  /* ---------------- PAGINATION LOGIC ---------------- */
  const sortedOrders = [...(orderList || [])].sort(
    (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
  );

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  /* -------------------------------------------------- */

  // Gửi yêu cầu huỷ đơn (bạn sẽ thay bằng API thật)
  async function handleSubmitCancelOrder() {
    if (!cancelReason) {
      alert("Vui lòng chọn lý do hủy!");
      return;
    }

    console.log("Hủy đơn:", {
      orderId: selectedOrderId,
      reason: cancelReason,
    });

    // 🟩 TẠI ĐÂY bạn gọi API cancelOrder (Redux hoặc axios)
    // dispatch(cancelOrder({ orderId: selectedOrderId, reason: cancelReason }));

    setOpenCancelDialog(false);
    setCancelReason("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử đặt hàng</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn hàng</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Ship</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Tổng</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.orderDate.split("T")[0]}</TableCell>

                <TableCell>
                  <Badge
                    className={
                      order.orderStatus === "confirmed"
                        ? "bg-green-600"
                        : order.orderStatus === "rejected"
                          ? "bg-red-600"
                          : "bg-black"
                    }
                  >
                    {order.orderStatus}
                  </Badge>
                </TableCell>

                <TableCell>{order.totalAmount.toLocaleString()} đ</TableCell>
                <TableCell>{order.shippingFee.toLocaleString()} đ</TableCell>
                <TableCell>{order.discountValue.toLocaleString()} đ</TableCell>

                <TableCell>
                  {(order.totalAmount + order.shippingFee - order.discountValue)
                    .toLocaleString()} đ
                </TableCell>

                <TableCell className="flex gap-2">
                  <Button onClick={() => handleFetchOrderDetails(order._id)}>
                    Xem chi tiết
                  </Button>

                  {order.orderStatus === "confirmed" && (
                    <Button
                      variant="destructive"
                      className="ml-2"
                      onClick={() => {
                        setSelectedOrderId(order._id);
                        setOpenCancelDialog(true);
                      }}
                    >
                      Hủy
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* ---------- PAGINATION UI ---------- */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Trang trước
          </Button>

          <p>
            Trang {currentPage} / {totalPages}
          </p>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Trang sau
          </Button>
        </div>
      </CardContent>

      {/* ---------- DIALOG CHI TIẾT ĐƠN ---------- */}
      <Dialog
        open={openDetailsDialog}
        onOpenChange={(open) => {
          setOpenDetailsDialog(open);
          if (!open) dispatch(resetOrderDetails());
        }}
      >
        <ShoppingOrderDetailsView orderDetails={orderDetails} />
      </Dialog>


      {/* ---------- DIALOG HỦY ĐƠN ---------- */}
      <Dialog open={openCancelDialog} onOpenChange={setOpenCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lý do hủy đơn hàng</DialogTitle>
            <DialogDescription>
              Vui lòng chọn lý do bạn muốn hủy đơn hàng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <select
              className="w-full border p-2 rounded"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            >
              <option value="">-- Chọn lý do --</option>
              <option value="Đổi ý">Đổi ý</option>
              <option value="Đặt nhầm sản phẩm">Đặt nhầm sản phẩm</option>
              <option value="Thời gian giao hàng lâu">Thời gian giao hàng lâu</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setOpenCancelDialog(false)}
            >
              Đóng
            </Button>

            <Button
              disabled={!cancelReason}
              onClick={() => {
                dispatch(
                  cancelOrder({
                    orderId: selectedOrderId,
                    reason: cancelReason
                  })
                );

                setOpenCancelDialog(false);
                setCancelReason("");
              }}
            >
              Xác nhận hủy
            </Button>

          </div>
        </DialogContent>
      </Dialog>


    </Card>
  );
}

export default ShoppingOrders;
