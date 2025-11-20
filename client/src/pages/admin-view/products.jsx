import AdminProductTile from "../../components/admin_view/product-title";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import ProductImageUpload from "../../components/admin_view/image-upload";
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
import VariantsEditor from "../../components/admin_view/variantsEditor";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  importPrice: "",
  averageReview: 0,
  variants: [],
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subImages, setSubImages] = useState([]);
  const [variantLoading, setVariantLoading] = useState({});

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
  useEffect(() => {
    setFormData(prev => ({ ...prev, image: uploadedImageUrl }));
  }, [uploadedImageUrl]);
  console.log("Submitting payload:", {
    ...formData,
    image: uploadedImageUrl
  });

  const onSubmit = (e) => {
    e.preventDefault();

    // Check ít nhất có 1 variant
    if (!formData.variants || formData.variants.length === 0) {
      toast({ title: "Vui lòng thêm ít nhất một màu sản phẩm" });
      return;
    }

    // Check tất cả variant có color + mainImage + ít nhất 1 size
    const invalidVariant = formData.variants.find(
      (v) => !v.color || !v.mainImage || !v.sizes || v.sizes.length === 0
    );
    if (invalidVariant) {
      toast({ title: "Vui lòng điền đầy đủ thông tin cho tất cả các màu và ảnh" });
      return;
    }

    // Build variants payload chuẩn
    const variantsPayload = formData.variants.map((v) => ({
      color: v.color,
      image: v.mainImage || "",
      subImages: v.subImages || [],
      sizes: v.sizes
        .filter((s) => s.size)
        .map((s) => ({
          size: s.size,
          stock: s.stock === "" ? 0 : parseInt(s.stock, 10),
        })),
    }));

    // Tính tổng stock
    const totalStock = variantsPayload.reduce((acc, v) => {
      const variantStock = v.sizes.reduce((sum, s) => sum + s.stock, 0);
      return acc + variantStock;
    }, 0);

    // Payload cuối cùng gửi lên backend
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      brand: formData.brand,
      price: formData.price === "" ? 0 : parseFloat(formData.price),
      salePrice: formData.salePrice === "" ? 0 : parseFloat(formData.salePrice),
      importPrice: formData.importPrice === "" ? 0 : parseFloat(formData.importPrice),
      totalStock,
      variants: variantsPayload,
      // image chính lấy từ variant đầu tiên nếu backend cần
      image: variantsPayload[0]?.image || "",
      // subImages chung nếu muốn, hoặc bỏ
      subImages: formData.subImages || [],
      averageReview: 0,
    };

    const action =
      currentEditedId !== null
        ? editProduct({ id: currentEditedId, formData: payload })
        : addNewProduct(payload);

    dispatch(action).then((data) => {
      if (data?.payload?.success) {
        toast({
          title:
            currentEditedId !== null
              ? "Cập nhật sản phẩm thành công"
              : "Thêm sản phẩm thành công",
        });
        dispatch(fetchAllProducts({ page: 1, limit: 9 }));

        // Reset form
        setOpenCreateProductsDialog(false);
        setCurrentEditedId(null);
        setFormData(initialFormData);
        setSubImages([]);
        setVariantLoading({});
      }
    });
  };






  const handleDelete = (id) => {
    // hiển thị confirm
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
    if (!isConfirmed) return;

    dispatch(deleteProduct(id)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Xóa sản phẩm thành công",
        });
        dispatch(fetchAllProducts({ page: 1, limit: 9 }));
      }
    });
  };


  const isFormValid = () =>
    Object.keys(formData)
      .filter((key) => key !== "averageReview")
      .every((key) => formData[key] !== "");
console.log(productList);

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

          {/* <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}

            subImages={subImages}
            setSubImages={setSubImages}
          /> */}


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

          <VariantsEditor
            variants={Array.isArray(formData.variants) ? formData.variants : []}
            setVariants={(v) => setFormData(prev => ({ ...prev, variants: v }))}
          />


        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
