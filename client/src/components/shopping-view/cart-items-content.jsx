import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { toast, Toaster } from "sonner";
import { useTranslation } from "react-i18next";


function UserCartItemsContent({ cartItem }) {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const { allProducts } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();

  console.log(cartItem.stock);

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction === "plus") {
      const getCartItems = cartItems.items || [];
      const currentQty = getCartItem.quantity;
      const stock = getCartItem.stock;
      if (typeOfAction === "plus") {
    if (currentQty + 1 > stock) {
      toast.warning(`Cửa hàng chỉ còn ${stock} sản phẩm`);
      return; // ⛔ KHÔNG GỬI REQUEST LÊN BACKEND
    }
  }
      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId && item.size === getCartItem?.size
        );

        // tìm sản phẩm trong allProducts
        const currentProduct = allProducts.find(
          (product) => product._id.toString() === getCartItem?.productId.toString()
        );

        if (!currentProduct) {
          toast.warning("Sản phẩm không tồn tại");
          return;
        }


      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
        size: getCartItem?.size,
        color: getCartItem?.color,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Cập nhật giỏ hàng thành công");
      })
      .catch((err) => {
        toast.warning(err?.message || `Cửa hàng chỉ còn ${cartItem.stock} sản phẩm`);
      });

  }



  function handleCartItemDelete(getCartItem) {

    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId: getCartItem?.productId,
        size: getCartItem?.size?.trim().toLowerCase(),
        color: getCartItem?.color?.trim().toLowerCase(),
      })
    ).then((res) => {
      if (res?.payload?.success) {
        toast.info("Xoá sản phẩm thành công");
        dispatch(fetchCartItems(user?.id));
      }
    });
  }




  return (
    <div className="flex items-center space-x-4">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.title}</h3>
        <h5 className="">Size: {cartItem?.size} — {t(`Màu: ${cartItem?.color}`)}</h5>
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">

          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toLocaleString()} đ
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-1"
          size={20}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;