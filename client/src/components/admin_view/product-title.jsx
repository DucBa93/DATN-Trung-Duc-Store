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
          <h2 className="text-md font-bold mb-2 mt-2">Tên sản phẩm : {product?.title}</h2>
          <p className=" flex-grow"><span className="font-bold">Mô tả:</span> {product?.description}</p>
          <p className=" flex-grow"><span className="font-bold">Thương hiệu:</span> {product?.brand}</p>
          <p className=" flex-grow"><span className="font-bold">Giá nhập:</span> {product?.importPrice}</p>
          <p className=" flex-grow"><span className="font-bold">Giá bán:</span> {product?.price}</p>
          <p className=" flex-grow"><span className="font-bold">Giá đang sale: </span>{product?.salePrice}</p>
          <p className=" flex-grow"><span className="font-bold">Số lượng đã: </span>  {product?.sold}</p>
          <p className=" flex-grow"><span className="font-bold">Số màu:</span> {product?.variants.length}</p>
          <p className=" flex-grow"><span className="font-bold">Tồn kho:</span> {product?.totalStock}</p>
         

          
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
