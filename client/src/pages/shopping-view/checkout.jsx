import Address from "@/components/shopping-view/address";
import img from "../../assets/Banner1.webp";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function ShoppingCheckout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const { appliedCoupon } = useSelector((state) => state.coupons);

  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);



  // Tính tổng gốc
  const totalCartAmount =
    cartItems?.items?.reduce(
      (sum, item) =>
        sum +
        (item?.salePrice > 0 ? item?.salePrice : item?.price) *
        item?.quantity,
      0
    ) || 0;

  // Tính giảm giá
  const discount = appliedCoupon
    ? Math.min(
      (appliedCoupon?.discountPercentage / 100) * totalCartAmount,
      appliedCoupon.maxDiscount
    )
    : 0;
  // phí ship theo city
  const getShippingFee = () => {
    if (!currentSelectedAddress?.city) return 30000;

    const feeMap = {
      "Hà Nội": 20000,
      "Hồ Chí Minh": 25000,
      "Đà Nẵng": 15000,
    };

    return totalCartAmount > 5000000
      ? 0
      : feeMap[currentSelectedAddress.city] || 30000;
  };
  const shippingFee = getShippingFee();

  // Tổng cuối
  const finalAmount = totalCartAmount - discount + shippingFee;

  const handleCODPayment = async () => {
  if (!cartItems?.items?.length) {
    toast.info("Giỏ hàng trống!");
    return;
  }

  if (!currentSelectedAddress) {
    toast.info("Vui lòng chọn địa chỉ!");
    return;
  }

  try {
    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,

      cartItems: cartItems.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.salePrice > 0 ? item.salePrice : item.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      })),

      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },

      totalAmount: totalCartAmount,
      discountValue: discount,
      appliedCoupon: appliedCoupon || null,
      paymentMethod: "cod",
      shippingFee: shippingFee,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    const res = await axios.post(
      "http://localhost:5000/api/shop/order/create",
      orderData
    );

    if (res.data.success) {
      toast.success("Đặt hàng thành công (COD)!");

      navigate(`/shop/payment-success`);
    } else {
      toast.error("Tạo đơn thất bại!");
    }
  } catch (err) {
    console.error(err);
    toast.error("Lỗi không thể tạo đơn COD!");
  }
};



  function handleInitiatePaypalPayment() {
    if (!cartItems?.items?.length) {
      toast.info("Giỏ hàng trống !")
      return;
    }

    if (!currentSelectedAddress) {
      toast.info("Vui lòng chọn địa chỉ !")
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount - discount, // ✅ trừ giảm giá
      discountValue: discount,
      appliedCoupon: appliedCoupon?.code || null, // ✅ thêm coupon
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
      shippingFee: shippingFee,
      finalAmount: finalAmount,

    };


    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
      } else {
        setIsPaymemntStart(false);
      }
    });
  }

  // Paypal redirect
  if (approvalURL) {
    window.location.href = approvalURL;
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        {/* ADDRESS */}
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />

        {/* PRODUCTS + PRICE */}
        <div className="flex flex-col gap-4">
          {cartItems?.items?.map((item) => (
            <UserCartItemsContent key={item._id} cartItem={item} />
          ))}

          {/* PRICE SUMMARY */}
          <div className="mt-8 space-y-3 border-t pt-4 text-[17px]">
            <div className="flex justify-between">
              <span>{t("Tổng giá sản phẩm dự kiến")}</span>
              <span>{totalCartAmount.toLocaleString()} đ</span>
            </div>

            {appliedCoupon && (

              <div className="flex justify-between text-green-600">
                <span>{t("Giảm giá")} ({appliedCoupon.code})</span>
                <span>-{discount.toLocaleString()} đ</span>
              </div>

            )}
            <div className="flex justify-between mt-2">
              <span>{t("Phí vận chuyển")}</span>
              <span>{shippingFee.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>{t('Tổng')} </span>
              <span>{finalAmount.toLocaleString()} đ</span>
            </div>
          </div>

          {/* CHECKOUT BUTTON */}
          <div className="mt-4 w-full">
            <Button onClick={handleInitiatePaypalPayment} className="w-full">
              {isPaymentStart
                ? `${t("Xử lý thanh toán Paypal...")}`
                : `${t("Thanh toán với Paypal")}`}
            </Button>

            <Button
              onClick={handleCODPayment}
              className="w-full mt-1.5"
            >
              {t('Thanh toán khi nhận hàng (COD)')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
