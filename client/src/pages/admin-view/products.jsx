import ProductImageUpload from "../../components/admin_view/image-upload";
import AdminProductTile from "../../components/admin_view/product-title";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Input, Pagination } from "antd";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "../../components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { productList, pagination } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchAllProducts({ page: 1, limit: 9 }));
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(fetchAllProducts({ search: searchTerm, page: 1, limit: 9 }));
  };

  const handleChangePage = (page) => {
    dispatch(fetchAllProducts({ page, limit: pagination.limit, search: searchTerm }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const action =
      currentEditedId !== null
        ? editProduct({ id: currentEditedId, formData })
        : addNewProduct({ ...formData, image: uploadedImageUrl });

    dispatch(action).then((data) => {
      if (data?.payload?.success) {
        toast({
          title:
            currentEditedId !== null
              ? "Cập nhật sản phẩm thành công"
              : "Thêm sản phẩm thành công",
        });
        dispatch(fetchAllProducts({ page: 1, limit: 9 }));
        setOpenCreateProductsDialog(false);
        setCurrentEditedId(null);
        setFormData(initialFormData);
        setImageFile(null);
      }
    });
  };

  const handleDelete = (id) => {
    dispatch(deleteProduct(id)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts({ page: 1, limit: 9 }));
      }
    });
  };

  const isFormValid = () =>
    Object.keys(formData)
      .filter((key) => key !== "averageReview")
      .every((key) => formData[key] !== "");

  return (
    <Fragment>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>
          <Button onClick={() => setOpenCreateProductsDialog(true)}>
            + Thêm sản phẩm
          </Button>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
          {productList?.length > 0 ? (
            productList.map((product) => (
              <AdminProductTile
                key={product._id}
                product={product}
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                handleDelete={handleDelete}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-3">
              Không có sản phẩm nào
            </p>
          )}
        </div>

        {/* Phân trang */}
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

      {/* Sheet thêm/sửa */}
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
            </SheetTitle>
          </SheetHeader>

          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />

          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Lưu" : "Thêm"}
              formControls={addProductFormElements}
              isBtnDisabled={false}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
