import { ChevronRight, StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { toast } from "sonner";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [openSizeGuide, setOpenSizeGuide] = useState(false); // ✅ thêm state mở bảng size

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    if (!selectedSize) {
      toast.info("Vui lòng chọn size trước khi thêm vào giỏ hàng!");
      return;
    }

    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) =>
          item.productId === getCurrentProductId &&
          item.selectedSize === selectedSize
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast.warning(`Cửa hàng chỉ còn ${getQuantity} sản phẩm`);
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
        size: selectedSize,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast.success("Thêm vào giỏ hàng thành công!");
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setSelectedSize("");
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    )
      .then((data) => {
        if (data?.payload?.success) {
          setRating(0);
          setReviewMsg("");
          dispatch(getReviews(productDetails?._id));
          toast.success("Thêm bình luận thành công!");
        } else {
          toast.error(data?.payload?.message || "Không thể thêm bình luận!");
        }
      })
      .catch(() => toast.error("Lỗi kết nối đến server!"));
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
      reviews.length
      : 0;

  const availableSizes = productDetails?.sizes || ["38", "38.5", "39", "40", "41", "42", "42.5", "43"];

  return (
    <>
      {/* Dialog chi tiết sản phẩm */}
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:p-12 max-w-[95vw] lg:max-w-[90vw] max-h-[90vh] overflow-y-auto rounded-2xl">
          {/* Ảnh sản phẩm */}
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={productDetails?.image}
              alt={productDetails?.title}
              width={600}
              height={600}
              className="aspect-square w-full object-cover"
            />
          </div>

          {/* Thông tin sản phẩm */}
          <div>
            <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
            <p className="text-muted-foreground text-2xl mb-5 mt-4">
              {productDetails?.description}
            </p>

            <div className="flex items-center gap-10">
              <p
                className={`text-3xl font-bold text-muted-foreground ${productDetails?.salePrice > 0 ? "line-through" : ""
                  }`}
              >
                {productDetails?.price.toLocaleString()} đ
              </p>
              {productDetails?.salePrice > 0 && (
                <p className="text-2xl font-bold text-primary">
                  {productDetails?.salePrice.toLocaleString()} đ
                </p>
              )}
            </div>

            {/* ✅ Khu vực chọn size */}
            <div className="mt-5">
              <Label>Chọn size</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {availableSizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className={`w-12 h-12 text-lg font-bold rounded-full transition ${selectedSize === size
                      ? "bg-primary text-white"
                      : "hover:bg-primary/10"
                      }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>

              {/* ✅ Nút mở bảng quy đổi kích cỡ */}
              <p
                onClick={() => setOpenSizeGuide(true)}
                className="text-gray-500 cursor-pointer mt-3 hover:underline flex items-center"
              >
                Bảng quy đổi kích cỡ
                <ChevronRight />
              </p>
            </div>

            {/* Rating trung bình */}
            <div className="flex items-center gap-2 mt-4">
              <StarRatingComponent rating={averageReview} />
              <span className="text-muted-foreground">
                ({averageReview.toLocaleString()})
              </span>
            </div>

            {/* Nút Add to Cart */}
            <div className="mt-5 mb-5">
              {productDetails?.totalStock === 0 ? (
                <Button className="w-full opacity-60 cursor-not-allowed">
                  Hết hàng
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() =>
                    handleAddToCart(
                      productDetails?._id,
                      productDetails?.totalStock
                    )
                  }
                >
                  Thêm vào giỏ hàng
                </Button>
              )}
            </div>

            <Separator />

            {/* Reviews */}
            <div className="max-h-[300px] overflow-auto">
              <h2 className="text-xl font-bold mb-4 mt-4">Đánh giá</h2>
              <div className="grid gap-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((reviewItem, index) => (
                    <div key={index} className="flex gap-4">
                      <Avatar className="w-10 h-10 border">
                        <AvatarFallback>
                          {reviewItem?.userName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{reviewItem?.userName}</h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarRatingComponent rating={reviewItem?.reviewValue} />
                        </div>
                        <p className="text-muted-foreground">
                          {reviewItem.reviewMessage}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <h1>Chưa có đánh giá nào</h1>
                )}
              </div>

              {/* Form thêm review */}
              <div className="mt-10 flex-col flex gap-2">
                <Label>Viết đánh giá của bạn</Label>
                <div className="flex gap-1">
                  <StarRatingComponent
                    rating={rating}
                    handleRatingChange={handleRatingChange}
                  />
                </div>
                <Input
                  name="reviewMsg"
                  value={reviewMsg}
                  onChange={(event) => setReviewMsg(event.target.value)}
                  placeholder="Nhập nội dung đánh giá..."
                />
                <Button
                  onClick={handleAddReview}
                  disabled={reviewMsg.trim() === ""}
                >
                  Gửi đánh giá
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Dialog hiển thị bảng quy đổi kích cỡ */}
      <Dialog open={openSizeGuide} onOpenChange={setOpenSizeGuide}>
        <DialogContent className="max-w-lg rounded-2xl">
          <h2 className="text-2xl !text-gray-500 font-bold text-center mb-4">
            Bảng Quy Đổi Kích Cỡ
          </h2>
          <p className="text-sm text-center text-muted-foreground mb-4">
            Thông số trong bảng quy đổi này có thể chênh lệch 1-2cm so với thực tế
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Size VN (Việt Nam)</th>
                  <th className="border px-4 py-2">size US</th>
                  <th className="border px-4 py-2">Centimet</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">38</td>
                  <td className="border px-4 py-2">7</td>
                  <td className="border px-4 py-2">24</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">38.5</td>
                  <td className="border px-4 py-2">7.5</td>
                  <td className="border px-4 py-2">24.5</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">39</td>
                  <td className="border px-4 py-2">8</td>
                  <td className="border px-4 py-2">25</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">40</td>
                  <td className="border px-4 py-2">8.5</td>
                  <td className="border px-4 py-2">25.5</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">41</td>
                  <td className="border px-4 py-2">9.5</td>
                  <td className="border px-4 py-2">26.5</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">42</td>
                  <td className="border px-4 py-2">10</td>
                  <td className="border px-4 py-2">27</td>
                </tr><tr>
                  <td className="border px-4 py-2">42.5</td>
                  <td className="border px-4 py-2">11</td>
                  <td className="border px-4 py-2">28</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">43</td>
                  <td className="border px-4 py-2">11</td>
                  <td className="border px-4 py-2">28</td>
                </tr>
          
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProductDetailsDialog;
