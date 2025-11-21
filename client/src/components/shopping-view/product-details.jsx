import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { setProductDetails } from "@/store/shop/products-slice";
import StarRatingComponent from "../common/star-rating";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  useEffect(() => {
    if (open && productDetails?._id) {
      dispatch(getReviews(productDetails._id));
    }
  }, [open, productDetails]);

  const [openSizeGuide, setOpenSizeGuide] = useState(false);

  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [displayImages, setDisplayImages] = useState([]); // Ảnh chính + phụ hiển thị

  // Tính toán đánh giá trung bình
  const averageReview =
    reviews?.length > 0
      ? reviews.reduce((sum, r) => sum + r.reviewValue, 0) / reviews.length
      : 0;

  // Lấy danh sách màu có sẵn
  const availableColors = productDetails?.variants?.map((v) => v.color) || [];
  // Lấy danh sách size theo màu đã chọn
  const availableSizes =
    selectedColor && productDetails?.variants
      ? productDetails.variants
        .find((v) => v.color === selectedColor)
        ?.sizes.filter((s) => s.stock > 0) || []
      : [];
  // Khi chọn màu
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedSize(""); // reset size khi đổi màu

    const variant = productDetails.variants.find((v) => v.color === color);
    if (!variant) return;

    // Nếu mainImage rỗng → lấy subImages[0]
    const mainImg = variant.mainImage || variant.subImages?.[0] || productDetails.image || "";
    setSelectedImage(mainImg);

    // Display gallery: mainImage + subImages (trừ mainImage trùng)
    const galleryImages = [mainImg, ...(variant.subImages?.filter((img) => img !== mainImg) || [])];
    setDisplayImages(galleryImages);
  };


  // Nếu chưa chọn màu → load gallery chung
  useEffect(() => {
    if (!productDetails?.variants?.length) return;

    const firstVariant = productDetails.variants[0];
    setSelectedColor(firstVariant.color);
    setSelectedSize("");

    // Nếu mainImage rỗng → lấy subImages[0]
    const mainImg = firstVariant.mainImage || firstVariant.subImages?.[0] || productDetails.image || "";
    setSelectedImage(mainImg);

    // Display gallery: mainImage + subImages
    const galleryImages = [
      mainImg,
      ...(firstVariant.subImages?.filter((img) => img !== mainImg) || []),
    ];
    setDisplayImages(galleryImages);
  }, [productDetails]);


  const handleAddToCart = () => {
    if (!selectedColor) return toast.info("Chọn màu trước!");
    if (!selectedSize) return toast.info("Vui lòng chọn size trước!");

    const variant = productDetails.variants.find(v => v.color === selectedColor);
    const sizeObj = variant.sizes.find(s => s.size === selectedSize);
    if (!variant || !sizeObj) return toast.warning("Phiên bản sản phẩm không hợp lệ");

    const imageToSend = variant?.subImages[0] || productDetails.image;
    dispatch(addToCart({
      userId: user?.id,
      productId: productDetails._id,
      title: productDetails.title,
      price: productDetails.price,
      salePrice: productDetails.salePrice,
      size: selectedSize.trim().toLowerCase(),
      color: selectedColor.trim().toLowerCase(),
      image: imageToSend,
      quantity: 1
    })).then(res => {
      if (res.payload?.success) {
        toast.success(`${t("Thêm vào giỏ hàng thành công!")}`);
        dispatch(fetchCartItems(user?.id));
      } else {
        toast.error(res.payload?.message || "Thêm giỏ hàng thất bại");
      }
    });
  };




  const handleDialogClose = () => {
    setSelectedImage(null);
    setSelectedColor("");
    setSelectedSize("");
    setDisplayImages([]);
    setOpen(false);
    dispatch(setProductDetails(null));
    setRating(0);
    setReviewMsg("");
  };

  const handleAddReview = () => {
    if (!productDetails) return;

    dispatch(
      addReview({
        productId: productDetails._id,
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
          dispatch(getReviews(productDetails._id));
          toast.success("Thêm bình luận thành công!");
        } else {
          toast.error(data?.payload?.message || "Không thể thêm bình luận!");
        }
      })
      .catch(() => toast.error("Lỗi kết nối đến server!"));
  };
  console.log(productDetails);
  
  
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="flex flex-col gap-12 sm:p-12 max-w-[95vw] lg:max-w-[90vw] max-h-[90vh] overflow-y-auto rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ảnh */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative overflow-hidden rounded-xl border">
              <img
                src={selectedImage}
                alt={productDetails?.title}
                className="aspect-square w-full object-cover rounded-xl"
              />
            </div>

            {/* Gallery ảnh */}
            <div className="flex flex-wrap items-center gap-3 justify-center mt-2">
              {displayImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  onClick={() => setSelectedImage(img)}
                  className={`w-18 h-18 cursor-pointer rounded-lg border hover:scale-105 transition ${selectedImage === img ? "border-primary" : ""
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div>
            <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
            <p className="text-muted-foreground text-xl mb-5 mt-4">
              {productDetails?.description}
            </p>

            <div className="flex items-center gap-10">
              <p
                className={`text-3xl font-bold text-muted-foreground ${productDetails?.salePrice > 0 ? "line-through" : ""
                  }`}
              >
                {productDetails?.price?.toLocaleString()} đ
              </p>
              {productDetails?.salePrice > 0 && (
                <p className="text-2xl font-bold text-primary">
                  {productDetails?.salePrice?.toLocaleString()} đ
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                <StarRatingComponent rating={averageReview} />
              </div>
              <span className="text-muted-foreground">
                ({averageReview.toFixed(2)})
              </span>
            </div>
            <div className="mt-3 text-muted-foreground text-base">
              {t("Đã bán")}:{" "}
              <span className="font-bold text-primary">{productDetails?.sold} {t("sản phẩm")}</span>
            </div>
            {/* Chọn màu */}
            <div className="mt-5">
              <Label>{t("Chọn màu")}</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {availableColors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    className={`px-5 py-2 rounded-xl transition ${selectedColor === color
                      ? "bg-primary text-white"
                      : "hover:bg-primary/10"
                      }`}
                    onClick={() => handleColorSelect(color)}
                  >
                    {t(`${color}`)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chọn size */}
            <div className="mt-5">
              <Label>{t("Chọn size")}</Label>
              {!selectedColor && (
                <p className="text-sm text-red-500 mt-1">
                  Vui lòng chọn màu trước
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-2">
                {availableSizes.map((s) => (
                  <Button
                    key={s.size}
                    variant={selectedSize === s.size ? "default" : "outline"}
                    disabled={!selectedColor || s.stock === 0}
                    className={`w-12 h-12 text-lg font-bold rounded-full transition ${selectedSize === s.size
                      ? "bg-primary text-white"
                      : "hover:bg-primary/10"
                      }`}
                    onClick={() => setSelectedSize(s.size)}
                  >
                    {s.size}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <Label
                className="cursor-pointer text-primary font-bold hover:underline"
                onClick={() => setOpenSizeGuide(true)}
              >
                {t("Bảng hướng dẫn chọn size")}
              </Label>
            </div>

            {/* Thêm vào giỏ hàng */}
            <div className="mt-5 mb-5">
              <Button
                className="w-full"
                onClick={handleAddToCart}
                disabled={availableSizes.length === 0}
              >
                {t("Thêm vào giỏ hàng")}
              </Button>
            </div>
          </div>
        </div>

        {/* REVIEW */}
        <div>
          <Separator />
          <div className="max-h-[300px] overflow-auto mt-6">
            <h2 className="text-xl font-bold mb-4 mt-4">{t("Đánh giá")}</h2>
            {reviews?.length > 0 ? (
              reviews.map((r, idx) => (
                <div key={idx} className="flex gap-4 mb-3">
                  {/* Avatar */}
                  <Avatar className="w-10 h-10 border">
                    <AvatarFallback>{r.userName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* Content bên phải */}
                  <div className="flex flex-col gap-1">
                    {/* Tên user */}
                    <h3 className="font-bold">{r.userName}</h3>

                    {/* ⭐ Hiển thị sao theo hàng ngang */}
                    <div className="flex items-center">
                      <StarRatingComponent rating={r.reviewValue} />
                    </div>

                    {/* Nội dung review */}
                    <p className="text-muted-foreground">{r.reviewMessage}</p>
                  </div>
                </div>
              ))
            ) : (
              <h1>{t("Chưa có đánh giá nào")}</h1>
            )}


            {/* Form review */}
            <div className="mt-6 flex flex-col gap-2">
              <Label>{t("Viết đánh giá của bạn")}</Label>
              <div className="flex">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={(r) => setRating(r)}
                />
              </div>
              <Input
                name="reviewMsg"
                value={reviewMsg}
                onChange={(e) => setReviewMsg(e.target.value)}
                placeholder={t("Nhập nội dung đánh giá...")}
              />
              <Button onClick={handleAddReview} disabled={reviewMsg.trim() === ""}>
                {t('Gửi đánh giá')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      <Dialog open={openSizeGuide} onOpenChange={setOpenSizeGuide}>
        <DialogContent className="max-w-lg rounded-2xl">
          <h2 className="text-2xl !text-gray-500 font-bold text-center mb-4">
            {t("Bảng Quy Đổi Kích Cỡ")}
          </h2>
          <p className="text-sm text-center text-muted-foreground mb-4">
            {t("Thông số có thể chênh lệch 1-2cm")}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">VN</th>
                  <th className="border px-4 py-2">US</th>
                  <th className="border px-4 py-2">CM</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border px-4 py-2">38</td><td className="border px-4 py-2">7</td><td className="border px-4 py-2">24</td></tr>
                <tr><td className="border px-4 py-2">38.5</td><td className="border px-4 py-2">7.5</td><td className="border px-4 py-2">24.5</td></tr>
                <tr><td className="border px-4 py-2">39</td><td className="border px-4 py-2">8</td><td className="border px-4 py-2">25</td></tr>
                <tr><td className="border px-4 py-2">40</td><td className="border px-4 py-2">8.5</td><td className="border px-4 py-2">25.5</td></tr>
                <tr><td className="border px-4 py-2">41</td><td className="border px-4 py-2">9.5</td><td className="border px-4 py-2">26.5</td></tr>
                <tr><td className="border px-4 py-2">42</td><td className="border px-4 py-2">10</td><td className="border px-4 py-2">27</td></tr>
                <tr><td className="border px-4 py-2">42.5</td><td className="border px-4 py-2">11</td><td className="border px-4 py-2">28</td></tr>
                <tr><td className="border px-4 py-2">43</td><td className="border px-4 py-2">11</td><td className="border px-4 py-2">28</td></tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

    </Dialog>

  );
}

export default ProductDetailsDialog;
