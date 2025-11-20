import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { useEffect, useState } from "react";
import { fetchAllProducts } from "@/store/shop/products-slice";
import { useDispatch, useSelector } from "react-redux";
import { applyCoupon, removeCoupon } from "@/store/shop/coupon-slice";
import CouponSelection from "./couponSelection";
import { t } from "i18next";
import { useTranslation } from "react-i18next";


function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allProducts } = useSelector((state) => state.shopProducts);
  const { appliedCoupon } = useSelector((state) => state.coupons);
  const [openCoupon, setOpenCoupon] = useState(false);
  
  useEffect(() => {
    if (allProducts.length === 0) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, allProducts.length]);
 
  // Tổng tạm tính
  const totalCartAmount = cartItems?.reduce(
    (sum, item) =>
      sum +
      (item?.salePrice > 0 ? item?.salePrice : item?.price) * item.quantity,
    0
  ) || 0;

  // Giảm giá
  const discount = appliedCoupon
  ? Math.min(
      (appliedCoupon.discountPercentage / 100) * totalCartAmount,
      appliedCoupon.maxDiscount
    )
  : 0;

    
  
    
    
    
  return (
    <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{t("Giỏ hàng của bạn")}</SheetTitle>
      </SheetHeader>

      {/* ITEMS */}
      <div className="mt-8 space-y-4">
        {cartItems?.length > 0 ? (
          cartItems.map(item => (
            <UserCartItemsContent
              key={`${item.productId}-${item.size}-${item.color}`}
              cartItem={item}
              allProducts={allProducts}
            />
          ))
        ) : (
          <span className="text-gray-400">{t("Giỏ hàng trống...")}</span>
        )}
      </div>

      {/* PRICE */}
      <div className="mt-8 space-y-3 border-t pt-4">
        <div className="flex justify-between">
          <span className="font-semibold">{t("Tạm tính")}</span>
          <span className="font-semibold">
            {totalCartAmount.toLocaleString()} đ
          </span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-green-600 font-semibold">
            <span>Mã: {appliedCoupon.code}</span>
            <Button
              variant="ghost"
              className="text-red-500"
              onClick={() => dispatch(removeCoupon())}
            >
              Hủy
            </Button>
            <span>-{discount.toLocaleString()} đ</span>
          </div>
        )}

        <div className="flex justify-between text-lg font-bold border-t pt-3">
          <span>{t("Tổng thanh toán")}</span>
          <span>
            {(totalCartAmount - discount).toLocaleString()} đ
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full mt-5"
        onClick={() => setOpenCoupon(true)}
      >
        {t("Chọn mã giảm giá")}
      </Button>

      <CouponSelection
        open={openCoupon}
        setOpen={setOpenCoupon}
        totalAmount={totalCartAmount}
      />

      <Button
        onClick={() => {
          navigate("/shop/checkout");
          setOpenCartSheet(false);
        }}
        className="w-full mt-6"
      >
       {t("Thanh toán")}
      </Button>

    </SheetContent>
  );
}

export default UserCartWrapper;
