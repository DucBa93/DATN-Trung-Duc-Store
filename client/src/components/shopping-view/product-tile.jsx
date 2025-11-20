import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";


function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
    const { t } = useTranslation();

  return (
    <Card className="w-full max-w-sm mx-auto cursor-pointer flex flex-col h-full">
      {/* Phần nội dung chính */}
      <div className="flex-grow" onClick={() => handleGetProductDetails(product?._id)}>
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />

          {product?.totalStock === 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              {t("Hết hàng")}
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              {t(`Chỉ còn ${product?.totalStock} sản phẩm`)}
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              {t("Giảm giá")}
            </Badge>
          ) : null}
        </div>

        <CardContent className="p-4 flex flex-col justify-between">
          <h2 className="text-xl font-bold mb-2 line-clamp-1">
            {product?.title}
          </h2>
          <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
            <span><span>{t(`${categoryOptionsMap[product?.category]}`)}</span></span>
            <span>{brandOptionsMap[product?.brand]}</span>
          </div>

          <div className="flex justify-between items-center">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through text-gray-400" : "text-primary"
              } text-lg font-semibold`}
            >
              {product?.price?.toLocaleString()} đ
            </span>
            {product?.salePrice > 0 && (
              <span className="text-lg font-semibold text-primary">
                {product?.salePrice?.toLocaleString()} đ
              </span>
            )}
          </div>
        </CardContent>
      </div>

      {/* Nút Add to cart nằm luôn dưới cùng */}
      <CardFooter className="mt-auto">
        {product?.totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed" disabled>
            {t("Hết hàng")}
          </Button>
        ) : (
          <Button
            onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            className="w-full"
          >
            {t("Thêm vào giỏ hàng")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
