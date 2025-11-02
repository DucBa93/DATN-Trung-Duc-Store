const Feature = require("../../models/Feature");

// ✅ Thêm ảnh
const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;
    const featureImages = new Feature({ image });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// ✅ Lấy danh sách ảnh
const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});
    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// ✅ Xoá ảnh theo ID
const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedImage = await Feature.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        message: "Image not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully!",
      data: deletedImage,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };
