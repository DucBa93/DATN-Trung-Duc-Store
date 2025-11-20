import ProductImageUpload from "@/components/admin_view/image-upload-dash";
import { Button } from "@/components/ui/button";
import { addFeatureImage, getFeatureImages, deleteFeatureImage } from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  // ✅ Upload ảnh
  function handleUploadFeatureImage() {
    if (!uploadedImageUrl) return;
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  // ✅ Xoá ảnh
  function handleDeleteFeatureImage(id) {
    if (window.confirm("Bạn có chắc chắn muốn xoá ảnh này không?")) {
      dispatch(deleteFeatureImage(id)).then((data) => {
        if (data?.payload?.success) {
          dispatch(getFeatureImages());
        }
      });
    }
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
      />

      <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
        Tải ảnh
      </Button>

      <div className="flex flex-col gap-4 mt-5">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((featureImgItem) => (
              <div key={featureImgItem._id} className="relative group">
                <img
                  src={featureImgItem.image}
                  alt="Feature"
                  className="w-full h-[300px] object-cover rounded-lg shadow cursor-pointer"
                />

                {/* ✅ Icon xoá hiện khi hover */}
                <button
                  onClick={() => handleDeleteFeatureImage(featureImgItem._id)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          : (
            <p className="text-gray-500 text-center mt-4">
              Chưa có ảnh nào được tải lên
            </p>
          )}
      </div>
    </div>
  );
}

export default AdminDashboard;
