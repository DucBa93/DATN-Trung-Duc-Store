import { UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFile,
  setImageFile,
  uploadedImageUrl,
  setUploadedImageUrl,
  subImages = [],
  setSubImages = () => {},
}) {
  const mainInputRef = useRef(null);
  const subInputRef = useRef(null);

  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingSub, setUploadingSub] = useState(false);

  // ==========================
  // 1️⃣ Upload ảnh chính
  // ==========================
  const onMainFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const uploadMainImage = async () => {
    if (!imageFile) return;
    setUploadingMain(true);

    const form = new FormData();
    form.append("my_file", imageFile);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        form
      );

      if (res?.data?.success) {
        setUploadedImageUrl(res.data.result.url);
      }
    } catch (err) {
      console.log("Upload main image failed:", err);
    }

    setUploadingMain(false);
  };

  useEffect(() => {
    if (imageFile) uploadMainImage();
  }, [imageFile]);

  const removeMainImage = () => {
    setImageFile(null);
    setUploadedImageUrl("");
    if (mainInputRef.current) mainInputRef.current.value = "";
  };

  // ==========================
  // 2️⃣ Upload nhiều ảnh phụ
  // ==========================
  const onSubImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) uploadSubImages(files);
    if (subInputRef.current) subInputRef.current.value = "";
  };

  const uploadSubImages = async (files) => {
    setUploadingSub(true);

    const uploadedUrls = [];

    for (let file of files) {
      const form = new FormData();
      form.append("sub_files", file);

      try {
        const res = await axios.post(
          "http://localhost:5000/api/admin/products/upload-sub-images",
          form
        );

        if (res?.data?.success) {
          uploadedUrls.push(...res.data.urls);
        }
      } catch (err) {
        console.log("Upload sub image failed:", err);
      }
    }

    // ✅ Truyền mảng mới trực tiếp lên parent
    setSubImages([...subImages, ...uploadedUrls]);

    setUploadingSub(false);
  };

  const removeSub = (url) => {
    setSubImages(subImages.filter((img) => img !== url));
  };

  return (
    <div className="mt-4">
      {/* Ảnh chính */}
      <Label className="font-semibold mb-1 block">Ảnh chính</Label>

      <Input
        ref={mainInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onMainFileChange}
      />

      {!uploadedImageUrl && !imageFile ? (
        <Label
          className="border-2 border-dashed h-32 flex flex-col justify-center items-center cursor-pointer rounded-lg"
          onClick={() => mainInputRef.current?.click()}
        >
          <UploadCloudIcon className="w-10 h-10 mb-2 text-gray-400" />
          Chọn ảnh
        </Label>
      ) : uploadingMain ? (
        <Skeleton className="w-full h-20" />
      ) : (
        <div className="flex gap-3 items-center mt-2">
          <img
            src={uploadedImageUrl}
            className="w-20 h-20 object-cover rounded border"
          />
          <Button size="icon" variant="destructive" onClick={removeMainImage}>
            <XIcon />
          </Button>
        </div>
      )}

      {/* Ảnh phụ */}
      <Label className="font-semibold mt-4 block">Ảnh phụ</Label>

      <Input
        type="file"
        multiple
        accept="image/*"
        ref={subInputRef}
        onChange={onSubImageChange}
        className="mt-2"
      />

      <div className="flex gap-3 flex-wrap mt-3">
        {Array.isArray(subImages) &&
          subImages.map((img, i) => (
            <div key={i} className="relative">
              <img className="w-20 h-20 object-cover rounded border" src={img} />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2"
                onClick={() => removeSub(img)}
              >
                <XIcon className="w-3 h-3" />
              </Button>
            </div>
          ))}

        {uploadingSub && <Skeleton className="w-20 h-20" />}
      </div>
    </div>
  );
}

export default ProductImageUpload;
