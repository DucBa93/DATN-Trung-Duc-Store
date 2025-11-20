import { Button } from "@/components/ui/button";
import {
  Baby,
  ChevronLeftIcon,
  ChevronRightIcon,
  Mars,
  Venus,
  WatchIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";
import { toast } from "sonner";
import { SiNike, SiPuma, SiNewbalance, SiMlb } from "react-icons/si";
import { CgAdidas } from "react-icons/cg";
import { Pagination } from "antd";
import { useTranslation } from "react-i18next";


const categoriesWithIcon = [
  { id: "men", label: "Nam", icon: Mars },
  { id: "women", label: "Nữ", icon: Venus },
  { id: "kids", label: "Trẻ em", icon: Baby },
  { id: "accessories", label: "Phụ kiện", icon: WatchIcon },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: SiNike },
  { id: "adidas", label: "Adidas", icon: CgAdidas },
  { id: "puma", label: "Puma", icon: SiPuma },
  { id: "New Balance", label: "New Balance", icon: SiNewbalance },
  { id: "MLB", label: "MLB", icon: SiMlb },
];

function ShoppingHome() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails, pagination } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ⚡ Điều hướng sang trang listing (lọc theo brand / category)
  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  // ⚡ Xem chi tiết sản phẩm
  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  // ⚡ Thêm vào giỏ hàng
  function handleAddtoCart(getCurrentProductId) {
    const currentProduct = productList.find(
      (product) => product._id === getCurrentProductId
    );
    const existingCartItem = cartItems?.items?.find(
      (item) => item.productId === getCurrentProductId
    );
    const currentQuantity = existingCartItem ? existingCartItem.quantity : 0;

    if (currentQuantity + 1 > currentProduct?.totalStock) {
      toast.warning(`Cửa hàng chỉ còn ${currentProduct?.totalStock} sản phẩm!`);
      return;
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast.success("Thêm thành công!");
      }
    });
  }

  // ⚡ Load lại sản phẩm khi trang thay đổi
  const handleChangePage = (page) => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
        page,
        limit: pagination.limit,
      })
    );
  };

  // ⚡ Tự mở dialog khi có chi tiết sản phẩm
  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  // ⚡ Tự động chuyển slide banner
  useEffect(() => {
    const timer = setInterval(() => {
      if (featureImageList.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % featureImageList.length);
      }
    }, 2500);
    return () => clearInterval(timer);
  }, [featureImageList]);

  // ⚡ Load sản phẩm khi mới vào trang
  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
        page: 1,
        limit: 8,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 🖼️ Banner */}
      <div className="relative w-full h-[600px] overflow-hidden">
        {featureImageList?.map((slide, index) => (
          <img
            key={index}
            src={slide?.image}
            className={`${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000`}
          />
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prev) =>
                (prev - 1 + featureImageList.length) % featureImageList.length
            )
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % featureImageList.length)
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* 🏷️ Category */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("Sản phẩm theo danh mục")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoriesWithIcon.map((categoryItem, index) => (
              <Card
                key={index}
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <categoryItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{t(`${categoryItem.label}`)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🏷️ Brand */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t( "Sản phẩm theo thương hiệu")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {brandsWithIcon.map((brandItem, index) => (
              <Card
                key={index}
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <brandItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{t(`${brandItem.label}`)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🛒 Feature Products + Pagination */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
              {t("Sản phẩm đặc trưng")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList?.length > 0 ? (
              productList.map((productItem, index) => (
                <ShoppingProductTile
                  key={index}
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                />
              ))
            ) : (
              <p className="text-center col-span-4 text-gray-500">
                Không có sản phẩm nào
              </p>
            )}
          </div>

          {/* 🔢 Pagination */}
          {pagination?.totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <Pagination
                current={pagination.page}
                total={pagination.totalPages * pagination.limit}
                pageSize={pagination.limit}
                onChange={handleChangePage}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;
