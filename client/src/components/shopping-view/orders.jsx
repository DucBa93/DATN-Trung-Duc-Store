import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersByUserId(user?.id));
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  console.log(orderList);

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
              <TableHead>Ngày đặt</TableHead>
              <TableHead>Trạng thái đơn hàng</TableHead>
              <TableHead>Giá sản phẩm</TableHead>
              <TableHead>Phí ship</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
  {orderList && orderList.length > 0
    ? [...orderList]
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) // ⬅️ thêm dòng này
        .map((orderItem) => (
          <TableRow key={orderItem?._id}>
            <TableCell>{orderItem?._id || "N/A"}</TableCell>

            <TableCell>{orderItem?.orderDate?.split("T")[0]}</TableCell>

            <TableCell>
              <Badge
                className={`py-1 px-3 ${
                  orderItem?.orderStatus === "confirmed"
                    ? "bg-green-500"
                    : orderItem?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                {orderItem?.orderStatus}
              </Badge>
            </TableCell>

            <TableCell>
              {orderItem?.totalAmount?.toLocaleString() || 0} đ
            </TableCell>

            <TableCell>
              {orderItem?.shippingFee?.toLocaleString() || 0} đ
            </TableCell>

            <TableCell>
              {orderItem?.discountValue.toLocaleString() || "Không có"}
            </TableCell>

            <TableCell>
              {(orderItem?.totalAmount +
                orderItem?.shippingFee -
                orderItem?.discountValue)?.toLocaleString()} đ
            </TableCell>

            <TableCell>
              <Dialog
                open={openDetailsDialog}
                onOpenChange={() => {
                  setOpenDetailsDialog(false);
                  dispatch(resetOrderDetails());
                }}
              >
                <Button
                  onClick={() => handleFetchOrderDetails(orderItem?._id)}
                >
                  Xem chi tiết
                </Button>

                <ShoppingOrderDetailsView orderDetails={orderDetails} />
              </Dialog>
            </TableCell>
          </TableRow>
        ))
    : null}
</TableBody>

        </Table>
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
