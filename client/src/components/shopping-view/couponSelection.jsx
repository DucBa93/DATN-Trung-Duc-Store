import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { toast } from "sonner";
import { fetchAllCoupons, fetchGiftCoupons, applyCouponBackend } from "@/store/shop/coupon-slice";

export default function CouponSelection({ open, setOpen, totalAmount }) {
  const dispatch = useDispatch();
  const { giftCoupons, appliedCoupon } = useSelector(state => state.coupons);
  const { user } = useSelector(state => state.auth);

  // Load tất cả coupon
  useEffect(() => {
    dispatch(fetchAllCoupons());
  }, [dispatch]);

  // Random gift coupon cho user khi mở popup
  useEffect(() => {
    if (open && user?.id) {
      dispatch(fetchGiftCoupons(user.id))
        .unwrap()
        .then(coupons => {
          if (coupons.length > 0) toast.success(`Bạn nhận ${coupons.length} mã giảm giá 🎁`);
        });
    }
  }, [open, user?.id, dispatch]);

  const handleApply = async (coupon) => {
    try {
      await dispatch(applyCouponBackend(coupon.code)).unwrap();
      setOpen(false);
    } catch (err) {
      alert(err || "Mã giảm giá không hợp lệ hoặc hết lượt.");
    }
  };

  // Lọc các coupon hợp lệ: chưa hết hạn và còn lượt sử dụng
  const validCoupons = giftCoupons.filter(coupon => {
  const now = new Date();
  const expiry = new Date(coupon.expiry);

  const usageLimit = coupon.usageLimit ?? 1;
  const usedCount = coupon.usedCount ?? 0;

  return expiry >= now && usedCount < usageLimit;
});
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogTitle>Chọn mã giảm giá</DialogTitle>
        <div className="space-y-4 mt-4">
          {validCoupons.length > 0 ? validCoupons.map(coupon => {
            const discount = Math.min(
              (coupon.discountPercentage / 100) * totalAmount,
              coupon.maxDiscount || Infinity
            );

            return (
              <div key={coupon._id} className="border p-3 rounded-lg flex flex-col gap-2">
                <div className="flex justify-between font-semibold">
                  <span>{coupon.code} 🎁</span>
                  <span className="text-green-600">-{discount.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>HSD: {new Date(coupon.expiry).toLocaleDateString("vi-VN")}</span>
                </div>
                <Button
                  variant={appliedCoupon?.code === coupon.code ? "secondary" : "default"}
                  onClick={() => handleApply(coupon)}
                  className="mt-2"
                >
                  {appliedCoupon?.code === coupon.code ? "Đang áp dụng" : "Chọn"}
                </Button>
              </div>
            )
          }) : <span className="text-gray-400">Chưa có mã giảm giá hợp lệ</span>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
