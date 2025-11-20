import ProductImageUpload from "../../components/admin_view/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VariantsEditor({ variants, setVariants }) {

  // 🔥 luôn clone sâu: không bao giờ mutate trực tiếp
  const updateVariant = (index, key, value) => {
    const updated = variants.map((v, i) =>
      i === index ? { ...v, [key]: value } : v
    );
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        color: "",
        mainImage: "",
        imageFile: null,
        subImages: [],
        sizes: [],
      },
    ]);
  };

  const addSize = (variantIndex) => {
    const updated = variants.map((v, i) =>
      i === variantIndex
        ? { ...v, sizes: [...v.sizes, { size: "", stock: 0 }] }
        : v
    );
    setVariants(updated);
  };

  const updateSize = (variantIndex, sizeIndex, key, value) => {
    const updated = variants.map((v, i) => {
      if (i !== variantIndex) return v;
      const newSizes = v.sizes.map((s, idx) =>
        idx === sizeIndex ? { ...s, [key]: value } : s
      );
      return { ...v, sizes: newSizes };
    });
    setVariants(updated);
  };

  const removeSize = (variantIndex, sizeIndex) => {
    const updated = variants.map((v, i) => {
      if (i !== variantIndex) return v;
      return { ...v, sizes: v.sizes.filter((_, idx) => idx !== sizeIndex) };
    });
    setVariants(updated);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-6">
      <h3 className="font-bold mb-4 text-lg">Quản lý biến thể</h3>

      {variants.map((variant, idx) => (
        <div key={idx} className="border p-4 rounded-lg mb-4">

          {/* Color */}
          <Input
            value={variant.color}
            onChange={(e) => updateVariant(idx, "color", e.target.value)}
            placeholder="Màu sắc"
            className="mb-3"
          />

          {/* Image upload */}
          <ProductImageUpload
            imageFile={variant.imageFile}
            setImageFile={(file) => updateVariant(idx, "imageFile", file)}
            uploadedImageUrl={variant.mainImage}
            setUploadedImageUrl={(url) =>
              updateVariant(idx, "mainImage", url)
            }
            subImages={variant.subImages}
            setSubImages={(arr) =>
              updateVariant(idx, "subImages", [...arr]) // clone sâu
            }
          />

          {/* Size manager */}
          <div className="mt-4 flex flex-col">
            <Label className="font-semibold mb-2">Kích cỡ & số lượng</Label>

            {variant.sizes.map((s, sIdx) => (
              <div key={sIdx} className="flex gap-2 mb-2">
                <Input
                  placeholder="Size"
                  value={s.size}
                  onChange={(e) =>
                    updateSize(idx, sIdx, "size", e.target.value)
                  }
                  className="w-24"
                />

                <Input
                  placeholder="Stock"
                  type="number"
                  value={s.stock}
                  onChange={(e) =>
                    updateSize(idx, sIdx, "stock", Number(e.target.value))
                  }
                  className="w-24"
                />

                <Button
                  variant="destructive"
                  onClick={() => removeSize(idx, sIdx)}
                >
                  X
                </Button>
              </div>
            ))}

            <Button size="sm" onClick={() => addSize(idx)}>
              Thêm size
            </Button>
          </div>

          <Button
            variant="destructive"
            className="mt-3"
            onClick={() => removeVariant(idx)}
          >
            Xóa biến thể
          </Button>
        </div>
      ))}

      <Button onClick={addVariant}>Thêm màu mới</Button>
    </div>
  );
}

export default VariantsEditor;
