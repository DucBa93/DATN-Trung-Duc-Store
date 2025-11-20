import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import { Input, Pagination } from "antd";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShipperOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
  deleteOrderForAdmin
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";




function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails, pagination } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }
  
  
  const handleChangePage = (page) => {
      dispatch(getAllOrdersForAdmin({ page, limit: pagination.limit }));
    };
  const handleDeleteOrder = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá đơn hàng này không?")) {
      dispatch(deleteOrderForAdmin(id)).then((data) => {
        if (data?.payload?.success) {
          toast.success("Đã xoá đơn hàng thành công!");
          dispatch(getAllOrdersForAdmin()); // cập nhật lại danh sách
        } else {
          toast.error(data?.payload?.message || "Xoá thất bại!");
        }
      });
    }
  };

  useEffect(() => {
    dispatch(getAllOrdersForAdmin({ page: pagination.page, limit: pagination.limit }));
  }, [dispatch, pagination.page]);



  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);
  console.log(orderList);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tất cả đơn hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn hàng</TableHead>
              <TableHead>Thời gian đặt</TableHead>
              <TableHead>Trạng thái đơn hàng</TableHead>
              <TableHead>Giá sản phẩm</TableHead>
              <TableHead>Phí vận chuyển</TableHead>
              <TableHead>Giá tổng đơn hàng</TableHead>
              <TableHead>
                <span className="sr-only">Chi tiết</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList && orderList.length > 0
              ? orderList.map((orderItem) => (
                <TableRow>
                  <TableCell>{orderItem?._id}</TableCell>
                  <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                  <TableCell>
                    <Badge
                      className={`py-1 px-3 ${orderItem?.orderStatus === "confirmed"
                          ? "bg-green-500"
                          : orderItem?.orderStatus === "rejected"
                            ? "bg-red-600"
                            : "bg-black"
                        }`}
                    >
                      {orderItem?.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{orderItem?.totalAmount.toLocaleString()} đ</TableCell>             
                  <TableCell>{orderItem?.shippingFee.toLocaleString()} đ</TableCell>
                  <TableCell>{orderItem?.finalAmount.toLocaleString()} đ</TableCell>
                  <TableCell>
                    <Dialog
                      open={openDetailsDialog}
                      onOpenChange={() => {
                        setOpenDetailsDialog(false);
                        dispatch(resetOrderDetails());
                      }}
                    >
                      <Button
                        onClick={() =>
                          handleFetchOrderDetails(orderItem?._id)
                        }
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteOrder(orderItem?._id)}
                        title="Xoá đơn hàng"
                      ><Trash2 className="h-5 w-5 text-red-600 hover:text-red-700" />
                      </Button>
                      <ShipperOrderDetailsView orderDetails={orderDetails} />
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
              : null}
          </TableBody>
        </Table>
        {pagination?.totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <Pagination
              current={pagination.page}
              total={pagination.totalItems}
              pageSize={pagination.limit}
              onChange={handleChangePage}
              showSizeChanger={false}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;