import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);
 
  
  return (
    <DialogContent className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-[500px]">
      <div className="grid gap-6">
        {/* Thông tin đơn hàng */}
        <div className="grid gap-2">
          <div className="flex mt-6 gap-40 items-center justify-between">
            <p className="font-medium min-w-[100px]">Mã đơn hàng</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Ngày đặt</p>
            <Label>{orderDetails?.orderDate?.split("T")[0]}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Giá sản phẩm</p>
            <Label>{orderDetails?.totalAmount?.toLocaleString()} đ</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Phương thức thanh toán</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Trạng thái thanh toán</p>
            <Label>{orderDetails?.paymentStatus}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Trạng thái đơn hàng</p>
            <Label>
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
            </Label>
          </div>
        </div>

        <Separator />

        {/* Chi tiết sản phẩm */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Chi tiết đơn hàng</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems?.length > 0 ? (
                orderDetails.cartItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex flex-col gap-2 border-b py-2"
                  >
                    <p className="font-bold">Sản phẩm {index + 1}</p>
                    <div className="flex gap-4 items-center">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="grid gap-1">
                        <span>Tên sản phẩm: {item.title}</span>
                        <span>Số lượng: {item.quantity}</span>
                        <span>Giá: {item.price?.toLocaleString()} đ</span>
                        <span>Màu sắc: {item.color || "Không có"}</span>
                        <span>Kích cỡ: {item.size || "Không có"}</span>
                        <span>
                          Phí ship: {orderDetails?.shippingFee?.toLocaleString()} đ
                        </span>
                        <span>
                          Mã giảm giá: {orderDetails?.appliedCoupon?.code || "Không có"}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Không có sản phẩm nào</p>
              )}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Thông tin giao hàng */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Thông tin giao hàng</div>
            <div className="grid gap-0.5 text-muted-foreground">
              <span>Tên người đặt: {user?.userName || "Không xác định"}</span>
              <span>Địa chỉ: {orderDetails?.addressInfo?.address}</span>
              <span>Thành phố: {orderDetails?.addressInfo?.city}</span>
              <span>Pincode: {orderDetails?.addressInfo?.pincode}</span>
              <span>SĐT: {orderDetails?.addressInfo?.phone}</span>
              <span>Ghi chú: {orderDetails?.addressInfo?.notes || "Không có"}</span>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
