import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(updateOrderStatus({ id: orderDetails?._id, orderStatus: status })).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({ title: data?.payload?.message });
      }
    });
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-[700px] p-8">

  {/* Header Info */}
  <div className="grid gap-6">
    <div className="flex justify-between">
      <p className="font-medium">Mã đơn hàng</p>
      <Label className="text-right">{orderDetails?._id}</Label>
    </div>

    <div className="flex justify-between">
      <p className="font-medium">Thời gian đặt</p>
      <Label>{orderDetails?.orderDate?.split("T")[0]}</Label>
    </div>

    <div className="flex justify-between">
      <p className="font-medium">Giá sản phẩm</p>
      <Label>{orderDetails?.totalAmount.toLocaleString()} đ</Label>
    </div>

    <div className="flex justify-between">
      <p className="font-medium">Phương thức thanh toán</p>
      <Label>{orderDetails?.paymentMethod}</Label>
    </div>

    <div className="flex justify-between">
      <p className="font-medium">Trạng thái thanh toán</p>
      <Label>{orderDetails?.paymentStatus}</Label>
    </div>

    <div className="flex justify-between">
      <p className="font-medium">Trạng thái đơn hàng</p>
      <Badge
        className={`py-1 px-3 ${
          orderDetails?.orderStatus === "confirmed"
            ? "bg-green-500"
            : orderDetails?.orderStatus === "rejected"
            ? "bg-red-600"
            : "bg-black"
        }`}
      >
        {orderDetails?.orderStatus}
      </Badge>
    </div>
  </div>

  <Separator className="my-6" />

  {/* ORDER DETAILS */}
  <div>
    <h2 className="font-semibold text-lg mb-4">Chi tiết đơn hàng</h2>

    <ul className="grid gap-4">
      {orderDetails?.cartItems?.length > 0 &&
        orderDetails.cartItems.map((item, index) => (
          <li
            key={index}
            className="flex gap-4 bg-gray-100 p-4 rounded-2xl shadow-sm border"
          >
            {/* Product Image */}
            <img
              src={item.image}
              alt=""
              className="w-24 h-24 object-cover rounded-xl border bg-white"
            />

            {/* TEXT */}
            <div>
              <p className="font-bold mb-1">Sản phẩm {index + 1}</p>
              <p>Tên sản phẩm: {item.title}</p>
              <p>Số lượng: {item.quantity}</p>
              <p>Giá: {item.price.toLocaleString()} đ</p>
              <p>Màu sắc: {item.color}</p>
              <p>Kích cỡ: {item.size}</p>
            </div>
          </li>
        ))}
    </ul>
  </div>

  <Separator className="my-6" />

  {/* SHIPPING INFO */}
  <div className="grid gap-1">
    <h2 className="font-semibold text-lg mb-1">Thông tin giao hàng</h2>
    <p>Tên người nhận: {user?.userName}</p>
    <p>Địa chỉ: {orderDetails?.addressInfo?.address}</p>
    <p>Thành phố: {orderDetails?.addressInfo?.city}</p>
    <p>Pincode: {orderDetails?.addressInfo?.pincode}</p>
    <p>Số điện thoại: {orderDetails?.addressInfo?.phone}</p>
    <p>Ghi chú: {orderDetails?.addressInfo?.notes}</p>
  </div>

  <div className="mt-6">
    <CommonForm
      formControls={[
        {
          label: "Trạng thái đơn hàng",
          name: "status",
          componentType: "select",
          options: [
            { id: "pending", label: "Chưa giải quyết" },
            { id: "inProcess", label: "Đang tiến hành" },
            { id: "inShipping", label: "Đang giao" },
            { id: "delivered", label: "Đã giao" },
            { id: "rejected", label: "Từ chối" },
          ],
        },
      ]}
      formData={formData}
      setFormData={setFormData}
      buttonText={"Cập nhật trạng thái đơn hàng"}
      onSubmit={handleUpdateStatus}
    />
  </div>
</DialogContent>

  );
}

export default AdminOrderDetailsView;
