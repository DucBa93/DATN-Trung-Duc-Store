import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  return (
    <Card className="w-full min-w-[250px] max-w-sm mx-auto flex flex-col h-full">
      <div className="flex flex-col h-full">
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
        </div>

        {/* Card Content - chiếm hết không gian còn lại */}
        <CardContent className="flex flex-col flex-grow">
          <h2 className="text-xl font-bold mb-2 mt-2">{product?.title}</h2>
          <p className="italic flex-grow">{product?.description}</p>

          <div className="flex gap-4 justify-between items-center mt-3">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-black`}
            >
              {product?.price.toLocaleString()} đ
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-bold">{product?.salePrice.toLocaleString()} đ</span>
            ) : null}
          </div>
        </CardContent>

        {/* Footer luôn dính đáy */}
        <CardFooter className="mt-auto flex justify-between items-center">
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product?._id);
              setFormData(product);
            }}
            className="w-[45%]"
          >
            Sửa
          </Button>
          <Button
            onClick={() => handleDelete(product?._id)}
            variant="destructive"
            className="w-[45%]"
          >
            Xoá
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default AdminProductTile;
